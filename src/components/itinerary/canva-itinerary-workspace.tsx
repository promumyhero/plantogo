'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BentoCard } from '@/components/ui/bento-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { NumericCurrencyInput } from '@/components/ui/numeric-currency-input';
import { StrictTextInput } from '@/components/ui/strict-text-input';
import { TripWorkspaceSkeleton } from '@/components/ui/skeleton';
import { FinancialCharts } from '@/components/finance/financial-charts';
import { useAuth } from '@/lib/auth/context';
import { useTripStore } from '@/lib/store/trip-store';
import {
  calculateNetBalances,
  simplifyDebts,
  SplitParticipantInput,
} from '@/lib/split-bill/calculator';
import {
  ExpenseCategory,
  ItineraryItem,
  ItineraryItemType,
  JawaTengahCluster,
  SplitType,
  TripMemberRole,
} from '@/types/database';
import {
  Calendar,
  Check,
  CheckSquare,
  Copy,
  Edit3,
  Eye,
  Lock,
  MapPin,
  Plus,
  Receipt,
  Share2,
  ShieldCheck,
  Trash2,
  Unlock,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const ITEM_TYPE_OPTIONS = [
  { value: 'destination', label: 'Destinasi Wisata' },
  { value: 'meal', label: 'Kuliner & Makan' },
  { value: 'transit', label: 'Transit / Perjalanan' },
  { value: 'stay', label: 'Penginapan / Hotel' },
];

const CLUSTER_OPTIONS = [
  { value: 'Dieng', label: 'Dieng & Wonosobo' },
  { value: 'Magelang', label: 'Magelang & Borobudur' },
  { value: 'Semarang', label: 'Semarang & Kota Lama' },
  { value: 'Solo', label: 'Solo & Tawangmangu' },
  { value: 'Yogyakarta', label: 'Prambanan & Merapi' },
  { value: 'Karimunjawa', label: 'Jepara & Karimunjawa' },
];

const EXPENSE_CATEGORY_OPTIONS = [
  { value: 'food', label: 'Kuliner & Konsumsi' },
  { value: 'transport', label: 'Transport, BBM & Tol' },
  { value: 'lodging', label: 'Penginapan & Villa' },
  { value: 'tickets', label: 'Tiket Wisata' },
  { value: 'shopping', label: 'Oleh-Oleh & Belanja' },
  { value: 'other', label: 'Lainnya / Darurat' },
];

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  lodging: 'Penginapan & Villa',
  transport: 'Transport, BBM & Tol',
  food: 'Kuliner & Konsumsi',
  tickets: 'Tiket Wisata',
  shopping: 'Oleh-Oleh & Belanja',
  other: 'Lainnya / Darurat',
};

const CANVA_ROLE_OPTIONS = [
  {
    value: 'editor',
    label: 'Bisa Edit (Can Edit)',
    description: 'Bisa tambah, ubah & hapus baris yang tidak dikunci',
  },
  {
    value: 'viewer',
    label: 'Hanya Lihat (Can View)',
    description: 'Hanya bisa membaca tabel jadwal & rincian biaya',
  },
];

export function CanvaItineraryWorkspace({ initialTripId }: { initialTripId?: string }) {
  const router = useRouter();
  const { currentUser, switchEmailSession } = useAuth();
  const {
    bundles,
    isLoaded,
    getBundleById,
    getActiveMemberForTrip,
    addOrUpdateItineraryItem,
    deleteItineraryItem,
    bulkDeleteItineraryItems,
    clearAllItineraryItems,
    toggleLockItineraryItem,
    inviteMemberByEmail,
    updateMemberRole,
    updateMemberPersonalBudget,
    removeMember,
    addExpenseWithSplits,
    deleteExpense,
    recordSettlement,
  } = useTripStore();

  const activeTripId = initialTripId || bundles[0]?.trip.id || 'jateng-expedition-2026';
  const bundle = getBundleById(activeTripId) || bundles[0];

  // Canva-style View Tabs: Schedule Table vs Finance Table
  const [activeSection, setActiveSection] = useState<'schedule_table' | 'finance_table'>(
    'schedule_table'
  );
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Quick-Input Row State (Directly inside the Itinerary Table)
  const [newDay, setNewDay] = useState<string>('1');
  const [newStartTime, setNewStartTime] = useState<string>('08:30');
  const [newEndTime, setNewEndTime] = useState<string>('10:30');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newCluster, setNewCluster] = useState<JawaTengahCluster>('Dieng');
  const [newType, setNewType] = useState<ItineraryItemType>('destination');
  const [newCost, setNewCost] = useState<number>(0);
  const [newNotes, setNewNotes] = useState<string>('');

  // Inline Editing Row State (Canva Table cell editing)
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editDay, setEditDay] = useState<string>('1');
  const [editStartTime, setEditStartTime] = useState<string>('08:00');
  const [editEndTime, setEditEndTime] = useState<string>('10:00');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editCluster, setEditCluster] = useState<JawaTengahCluster>('Dieng');
  const [editType, setEditType] = useState<ItineraryItemType>('destination');
  const [editCost, setEditCost] = useState<number>(0);
  const [editPaidBy, setEditPaidBy] = useState<string>('');
  const [editSplitType, setEditSplitType] = useState<'all' | 'single' | 'custom'>('all');
  const [editCustomMembers, setEditCustomMembers] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState<string>('');

  // Canva-style Share / Access Modal State
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviteBudget, setInviteBudget] = useState<number>(2000000);

  // Quick Expense Entry Row in Finance Table
  const [expDay, setExpDay] = useState<string>('1');
  const [expTitle, setExpTitle] = useState<string>('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('food');
  const [expAmount, setExpAmount] = useState<number>(200000);
  const [expPaidBy, setExpPaidBy] = useState<string>('');
  const [expSplitType, setExpSplitType] = useState<SplitType>('equal');

  const totalDays = useMemo(() => {
    if (!bundle) return 3;
    const start = new Date(bundle.trip.start_date);
    const end = new Date(bundle.trip.end_date);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const maxItemDay = (bundle.itinerary || []).reduce((m, i) => Math.max(m, i.day_number || 1), 1);
    const validDiff = Number.isFinite(diff) && diff > 0 ? diff : 1;
    const validMaxItem = Number.isFinite(maxItemDay) && maxItemDay > 0 ? maxItemDay : 1;
    return Math.max(1, validDiff, validMaxItem);
  }, [bundle]);

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl">
        <TripWorkspaceSkeleton />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#2A2421]">Belum Ada Rencana Perjalanan</h2>
        <Link
          href="/trips/new"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4F5D48] px-5 py-2.5 text-xs font-bold text-white"
        >
          + Buat Rencana Baru
        </Link>
      </div>
    );
  }

  const { trip, members, itinerary, expenses, settlements, auditLogs } = bundle;
  const activeMember = getActiveMemberForTrip(trip.id, currentUser.email);
  const currentRole: TripMemberRole = activeMember?.role || 'viewer';

  const dayOptions = [
    { value: 'all', label: `Semua Hari (1–${totalDays})` },
    ...Array.from({ length: totalDays }).map((_, i) => ({
      value: String(i + 1),
      label: `Hari ke-${i + 1}`,
    })),
  ];

  const singleDayOptions = Array.from({ length: Math.max(totalDays, 5) }).map((_, i) => ({
    value: String(i + 1),
    label: `Hari ${i + 1}`,
  }));

  const scheduledRows = useMemo(() => {
    return (itinerary || [])
      .filter((i) => i.status !== 'wishlist')
      .filter((i) => (dayFilter === 'all' ? true : i.day_number === Number(dayFilter)))
      .sort((a, b) => {
        if (a.day_number !== b.day_number) return a.day_number - b.day_number;
        return a.start_time.localeCompare(b.start_time);
      });
  }, [itinerary, dayFilter]);

  const totalEstimatedCost = useMemo(
    () => scheduledRows.reduce((s, r) => s + r.estimated_cost, 0),
    [scheduledRows]
  );
  const totalActualSpent = useMemo(
    () => (expenses || []).reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const remainingBudget = trip.total_budget_plan - totalActualSpent;

  const netBalances = useMemo(
    () => calculateNetBalances(members, expenses, settlements),
    [members, expenses, settlements]
  );
  const simplifiedTransfers = useMemo(
    () => simplifyDebts(members, expenses, settlements),
    [members, expenses, settlements]
  );

  // Auto-calculate next sequential time slot from a day's last item
  const syncNextAvailableTime = (targetDay: number) => {
    const dayItems = (bundle.itinerary || [])
      .filter((i) => i.status !== 'wishlist' && i.day_number === targetDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    if (dayItems.length > 0) {
      const lastItem = dayItems[dayItems.length - 1];
      const [eh, em] = (lastItem.end_time || '10:00').split(':').map(Number);
      const [sh, sm] = (lastItem.start_time || '08:00').split(':').map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0 || Number.isNaN(dur) || dur > 360) dur = 90; // default 1.5 hours

      const nextStart = lastItem.end_time || '10:00';
      const nextStartTotalMins = eh * 60 + em;
      const nextEndTotalMins = Math.min(23 * 60 + 59, nextStartTotalMins + dur);
      const nextEndH = Math.floor(nextEndTotalMins / 60);
      const nextEndM = nextEndTotalMins % 60;
      const nextEnd = `${String(nextEndH).padStart(2, '0')}:${String(nextEndM).padStart(2, '0')}`;

      setNewStartTime(nextStart);
      setNewEndTime(nextEnd);
    } else {
      setNewStartTime('08:00');
      setNewEndTime('09:30');
    }
  };

  // Bulk Selection Helpers (Select All, Bulk Delete, Clear All)
  const isAllSelected =
    scheduledRows.length > 0 &&
    scheduledRows.every((r) => selectedRowIds.includes(r.id));
  const isPartiallySelected =
    selectedRowIds.length > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(scheduledRows.map((r) => r.id));
    }
  };

  const handleToggleSelectRow = (rowId: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.length === 0) return;
    if (
      !window.confirm(
        `Yakin ingin menghapus ${selectedRowIds.length} rencana perjalanan yang dipilih?`
      )
    ) {
      return;
    }
    bulkDeleteItineraryItems(trip.id, currentUser.email, selectedRowIds);
    setSelectedRowIds([]);
  };

  const handleClearAllSchedule = () => {
    if (
      !window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH rencana perjalanan pada trip ini?'
      )
    ) {
      return;
    }
    clearAllItineraryItems(trip.id, currentUser.email);
    setSelectedRowIds([]);
  };

  // Add a new row directly from the Table Quick-Input Bar with Auto-Advance Time
  const handleAddRowDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Tujuan / Kegiatan Wajib Diisi', {
        description: 'Ketik terlebih dahulu Anda ingin pergi ke mana atau melakukan apa.',
      });
      return;
    }

    const currentStartTime = newStartTime || '08:00';
    const currentEndTime = newEndTime || '10:00';

    const ok = addOrUpdateItineraryItem(
      trip.id,
      currentUser.email,
      {
        day_number: Number(newDay) || 1,
        start_time: currentStartTime,
        end_time: currentEndTime,
        item_type: newType,
        title: newTitle.trim(),
        location_name: newLocation.trim() || newCluster,
        city_cluster: newCluster,
        estimated_cost: newCost,
        notes: newNotes.trim(),
        status: 'scheduled',
        is_locked: false,
      },
      newCost > 0
        ? {
            paidByMemberId: activeMember?.id || members[0]?.id || '',
            splitType: 'all',
          }
        : undefined
    );

    if (ok) {
      // Auto-advance sequential time slot: automatically resume next start from current end_time
      const [sh, sm] = currentStartTime.split(':').map(Number);
      const [eh, em] = currentEndTime.split(':').map(Number);
      let durationMins = (eh * 60 + em) - (sh * 60 + sm);
      if (durationMins <= 0 || Number.isNaN(durationMins) || durationMins > 360) {
        durationMins = 90; // default 1.5 hours
      }

      const nextStart = currentEndTime;
      const nextStartTotalMins = eh * 60 + em;
      const nextEndTotalMins = Math.min(23 * 60 + 59, nextStartTotalMins + durationMins);

      const nextEndH = Math.floor(nextEndTotalMins / 60);
      const nextEndM = nextEndTotalMins % 60;
      const nextEnd = `${String(nextEndH).padStart(2, '0')}:${String(nextEndM).padStart(2, '0')}`;

      setNewStartTime(nextStart);
      setNewEndTime(nextEnd);

      setNewTitle('');
      setNewLocation('');
      setNewNotes('');

      toast.success('Rencana Berhasil Ditambahkan!', {
        description: `Waktu input berikutnya otomatis dilanjutkan dari jam ${nextStart} – ${nextEnd} WIB`,
      });
    }
  };

  // Start Inline Editing a Table Row
  const startInlineEdit = (item: ItineraryItem) => {
    if (currentRole === 'viewer') {
      toast.error('Akses Hanya Lihat (Can View)', {
        description: 'Anda tidak memiliki izin mengedit baris tabel ini.',
      });
      return;
    }
    if (item.is_locked && currentRole !== 'owner') {
      toast.error('Baris Dikunci oleh Owner', {
        description: 'Baris jadwal ini telah dikunci (Locked) seperti elemen di Canva.',
      });
      return;
    }
    setEditingRowId(item.id);
    setEditDay(String(item.day_number ?? 1));
    setEditStartTime(item.start_time || '08:00');
    setEditEndTime(item.end_time || '10:00');
    setEditTitle(item.title || '');
    setEditLocation(item.location_name || '');
    setEditCluster(item.city_cluster || 'Dieng');
    setEditType(item.item_type || 'destination');
    setEditCost(
      typeof item.estimated_cost === 'number' && Number.isFinite(item.estimated_cost)
        ? item.estimated_cost
        : 0
    );
    setEditNotes(item.notes || '');

    // Synchronize linked financial settings (Who paid & Who shares)
    const linkedExpense = bundle.expenses.find((e) => e.itinerary_item_id === item.id);
    const defaultPayer = activeMember?.id || bundle.members[0]?.id || '';
    if (linkedExpense) {
      setEditPaidBy(linkedExpense.paid_by_member_id || defaultPayer);
      const isSingle =
        linkedExpense.splits.length === 1 &&
        linkedExpense.splits[0].member_id === linkedExpense.paid_by_member_id;
      const isAll = linkedExpense.splits.length === bundle.members.length;

      if (isSingle) {
        setEditSplitType('single');
        setEditCustomMembers([linkedExpense.paid_by_member_id]);
      } else if (isAll) {
        setEditSplitType('all');
        setEditCustomMembers(bundle.members.map((m) => m.id));
      } else {
        setEditSplitType('custom');
        setEditCustomMembers(linkedExpense.splits.map((s) => s.member_id));
      }
    } else {
      setEditPaidBy(defaultPayer);
      setEditSplitType('all');
      setEditCustomMembers(bundle.members.map((m) => m.id));
    }
  };

  // Save Inline Edited Table Row
  const saveInlineEdit = (item: ItineraryItem) => {
    const ok = addOrUpdateItineraryItem(
      trip.id,
      currentUser.email,
      {
        id: item.id,
        day_number: Number(editDay) || item.day_number,
        start_time: editStartTime,
        end_time: editEndTime,
        item_type: editType,
        title: editTitle,
        location_name: editLocation || editCluster,
        city_cluster: editCluster,
        estimated_cost: editCost,
        notes: editNotes,
        status: item.status,
        is_locked: item.is_locked,
      },
      editCost > 0
        ? {
            paidByMemberId: editPaidBy || activeMember?.id || members[0]?.id || '',
            splitType: editSplitType,
            customMemberIds:
              editSplitType === 'custom'
                ? editCustomMembers
                : editSplitType === 'single'
                ? [editPaidBy || activeMember?.id || members[0]?.id || '']
                : members.map((m) => m.id),
          }
        : undefined
    );
    if (ok) {
      setEditingRowId(null);
    }
  };

  // Canva-Style Duplicate Row
  const handleDuplicateRow = (item: ItineraryItem) => {
    addOrUpdateItineraryItem(trip.id, currentUser.email, {
      day_number: item.day_number,
      start_time: item.start_time,
      end_time: item.end_time,
      item_type: item.item_type,
      title: `${item.title} (Salinan)`,
      location_name: item.location_name,
      city_cluster: item.city_cluster,
      estimated_cost: item.estimated_cost,
      notes: item.notes,
      status: 'scheduled',
      is_locked: false,
    });
  };

  // 1-Click Send Row to Actual Expense Table
  const handleSendRowToActualExpense = (item: ItineraryItem) => {
    const payerId = activeMember?.id || members[0]?.id;
    if (!payerId) return;

    const category: ExpenseCategory =
      item.item_type === 'meal'
        ? 'food'
        : item.item_type === 'transit'
        ? 'transport'
        : item.item_type === 'stay'
        ? 'lodging'
        : 'tickets';

    const participants: SplitParticipantInput[] = members.map((m) => ({
      member_id: m.id,
    }));

    addExpenseWithSplits({
      tripId: trip.id,
      actorEmail: currentUser.email,
      title: item.title,
      category,
      amount: item.estimated_cost > 0 ? item.estimated_cost : 100000,
      paidByMemberId: payerId,
      splitType: 'equal',
      participants,
      itineraryItemId: item.id,
      dayNumber: item.day_number,
    });
  };

  // Add Expense directly from Finance Table Row
  const handleAddExpenseRow = (e: React.FormEvent) => {
    e.preventDefault();
    const payerId = expPaidBy || activeMember?.id || members[0]?.id;
    if (!payerId) return;

    const participants: SplitParticipantInput[] = members.map((m) => ({
      member_id: m.id,
    }));

    const ok = addExpenseWithSplits({
      tripId: trip.id,
      actorEmail: currentUser.email,
      title: expTitle,
      category: expCategory,
      amount: expAmount,
      paidByMemberId: payerId,
      splitType: expSplitType,
      participants,
      dayNumber: Number(expDay) || 1,
    });

    if (ok) {
      setExpTitle('');
    }
  };

  const handleInviteInModal = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = inviteMemberByEmail(
      trip.id,
      currentUser.email,
      inviteEmail,
      inviteName,
      inviteRole,
      inviteBudget
    );
    if (ok) {
      setInviteEmail('');
      setInviteName('');
    }
  };

  const tripSelectOptions = bundles.map((b) => ({
    value: b.trip.id,
    label: b.trip.title,
    description: `${b.trip.start_date} s/d ${b.trip.end_date}`,
  }));

  const payerOptions = members.map((m) => ({
    value: m.id,
    label: `${m.display_name} (${m.role.toUpperCase()})`,
    description: m.invited_email,
  }));

  const splitScopeOptions = [
    { value: 'all', label: `Bagi Rata (Semua ${members.length} Orang)` },
    { value: 'single', label: 'Biaya Pribadi / Sendiri' },
    { value: 'custom', label: 'Pilih Anggota (Berdua / Bertiga)' },
  ];

  const splitTypeOptions = [
    { value: 'equal', label: `Bagi Rata (${members.length} Orang)` },
    { value: 'exact', label: 'Nominal Spesifik' },
    { value: 'percentage', label: 'Persentase (%)' },
  ];

  return (
    <div className="space-y-6">
      {/* =====================================================================
          TOP WORKSPACE BAR (Earth Tone + Canva-Style Share & Collaborator Bar)
      ===================================================================== */}
      <BentoCard variant="white" padding="md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Trip Selector & Dates */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
            <div className="w-full sm:min-w-65 sm:max-w-sm">
              <CustomSelect
                label="Rencana Perjalanan Aktif"
                value={trip.id}
                onChange={(nextId) => router.push(`/trips/${nextId}`)}
                options={tripSelectOptions}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 sm:pt-5">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#EFECE4] px-3 py-2 text-xs font-semibold text-[#4A423D]">
                <Calendar className="h-3.5 w-3.5 text-[#4F5D48]" />
                {trip.start_date} – {trip.end_date} ({totalDays} Hari)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#EFECE4] px-3 py-2 text-xs font-semibold text-[#4A423D]">
                <MapPin className="h-3.5 w-3.5 text-[#C46A4E]" />
                {trip.onboarding_answers.clusters.join(', ')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#EFECE4] px-3 py-2 text-xs font-semibold text-[#4A423D]">
                {trip.onboarding_answers.transport === 'kapal_laut'
                  ? '🚢'
                  : trip.onboarding_answers.transport === 'pesawat'
                  ? '✈️'
                  : '🚗'}{' '}
                {trip.onboarding_answers.budgetInclusion?.vehicleDetails ||
                  trip.onboarding_answers.transport.replace('_', ' ')}
              </span>
              {trip.onboarding_answers.budgetInclusion?.includesReturnTicket && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#EEF2EC] border border-[#C5D3BE] px-3 py-2 text-xs font-bold text-[#3F4D39]">
                  <span>✓ Tiket PP:</span>
                  <span className="tabular-nums">
                    Rp{' '}
                    {(
                      trip.onboarding_answers.budgetInclusion.returnTicketEstimate || 0
                    ).toLocaleString('id-ID')}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Canva-Style Avatar Stack + "Bagikan (Share)" Button */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E5DFD3]">
            {/* Earth-Tone Avatar Stack (Up to 4 Collaborators) */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    title={`${m.display_name} (${m.invited_email}) — ${
                      m.role === 'owner'
                        ? 'Owner'
                        : m.role === 'editor'
                        ? 'Bisa Edit'
                        : 'Hanya Lihat'
                    }`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-2xs"
                    style={{ backgroundColor: m.avatar_color || '#4F5D48' }}
                  >
                    {m.display_name.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2A2421]">
                  {members.length}/4 Kolaborator
                </p>
                <p className="text-[11px] text-[#7D736B]">
                  Akses Anda:{' '}
                  <strong className="uppercase text-[#4F5D48]">
                    {currentRole === 'owner'
                      ? 'Owner'
                      : currentRole === 'editor'
                      ? 'Can Edit'
                      : 'Can View'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Canva-Style "Bagikan / Izin Akses" Button */}
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F5D48] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#3F4B39] transition-all cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Bagikan & Izin Canva</span>
            </button>
          </div>
        </div>

        {/* Summary Strip: Plan vs Actual Budget */}
        <div className="mt-5 pt-4 border-t border-[#E5DFD3] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-[#7D736B]">Target Anggaran Trip</p>
            <p className="text-sm sm:text-base font-bold text-[#2A2421] tabular-nums truncate">
              Rp {trip.total_budget_plan.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-[#7D736B]">Total Estimasi di Tabel</p>
            <p className="text-sm sm:text-base font-bold text-[#8C6D53] tabular-nums truncate">
              Rp {totalEstimatedCost.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-[#7D736B]">Realisasi Pengeluaran</p>
            <p className="text-sm sm:text-base font-bold text-[#4F5D48] tabular-nums truncate">
              Rp {totalActualSpent.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-[#7D736B]">Sisa Anggaran</p>
            <p
              className={`text-sm sm:text-base font-bold tabular-nums truncate ${
                remainingBudget < 0 ? 'text-[#C46A4E]' : 'text-[#2A2421]'
              }`}
            >
              Rp {remainingBudget.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </BentoCard>

      {/* =====================================================================
          TABLE SWITCHER & FILTER BAR
      ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl bg-[#EFECE4] p-1 border border-[#DFD8CC] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSection('schedule_table')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'schedule_table'
                ? 'bg-white text-[#2A2421] shadow-2xs'
                : 'text-[#6E655E] hover:text-[#2A2421]'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-[#4F5D48] shrink-0" />
            <span>Tabel Jadwal Perjalanan ({scheduledRows.length} Baris)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('finance_table')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'finance_table'
                ? 'bg-white text-[#2A2421] shadow-2xs'
                : 'text-[#6E655E] hover:text-[#2A2421]'
            }`}
          >
            <Wallet className="h-3.5 w-3.5 text-[#C46A4E]" />
            <span>Tabel Keuangan & Split-Bill ({expenses.length} Transaksi)</span>
          </button>
        </div>

        {activeSection === 'schedule_table' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-45">
              <CustomSelect
                variant="compact"
                value={dayFilter}
                onChange={(v) => {
                  setDayFilter(v);
                  if (v !== 'all') {
                    setNewDay(v);
                    syncNextAvailableTime(Number(v));
                  }
                }}
                options={dayOptions}
              />
            </div>
            {scheduledRows.length > 0 && currentRole !== 'viewer' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isAllSelected
                      ? 'border-[#4F5D48] bg-[#4F5D48] text-white shadow-2xs'
                      : 'border-[#DFD8CC] bg-white text-[#5C534C] hover:bg-[#F2ECE1]'
                  }`}
                  title="Pilih semua baris dalam filter ini"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>{isAllSelected ? 'Batal Pilih' : 'Pilih Semua'}</span>
                </button>

                {currentRole === 'owner' && (
                  <button
                    type="button"
                    onClick={handleClearAllSchedule}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E8CFC8] bg-[#FDF6F4] px-2.5 py-1.5 text-xs font-semibold text-[#C46A4E] hover:bg-[#F9E6E0] transition-all cursor-pointer"
                    title="Kosongkan seluruh rencana perjalanan pada trip ini"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Kosongkan Semua</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          SECTION 1: INTERACTIVE ITINERARY TABLE (Input Sendiri: Mau Kemana, Jam Berapa, dll)
      ===================================================================== */}
      {activeSection === 'schedule_table' && (
        <div className="space-y-5">
          {/* Canva-Style Bulk Action Floating Bar */}
          {selectedRowIds.length > 0 && currentRole !== 'viewer' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#2A2421] px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F5D48] text-xs font-bold text-white">
                  {selectedRowIds.length}
                </span>
                <span className="text-xs font-semibold">
                  {selectedRowIds.length} rencana perjalanan terpilih
                </span>
                <span className="text-[11px] text-[#A69B90]">
                  (dari {scheduledRows.length} rencana)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  {isAllSelected ? 'Batal Pilih' : 'Pilih Semua'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRowIds([])}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-[#D6CEBE] hover:bg-white/20 transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#C46A4E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#B3583C] shadow-sm transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus {selectedRowIds.length} Terpilih</span>
                </button>
              </div>
            </div>
          )}
          {/* Direct Quick-Input Form Above Table (Only visible if Owner or Editor) */}
          {currentRole !== 'viewer' ? (
            <BentoCard variant="subtle" padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4F5D48] text-white">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-sm font-bold text-[#2A2421]">
                    Input Baris Jadwal Baru (Ketik Langsung Tujuan & Jam Anda)
                  </h2>
                </div>
                <span className="text-[11px] text-[#6E655E] hidden sm:inline">
                  Aturan input aktif: Biaya hanya menerima angka Rupiah
                </span>
              </div>

              <form
                onSubmit={handleAddRowDirect}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
              >
                <div className="lg:col-span-2">
                  <CustomSelect
                    label="Hari"
                    value={newDay}
                    onChange={(v) => {
                      setNewDay(v);
                      syncNextAvailableTime(Number(v));
                    }}
                    options={singleDayOptions}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-1.5">
                    Jam (Mulai – Selesai)
                  </label>
                  <div className="flex items-center gap-1 rounded-xl border border-[#DFD8CC] bg-white px-2.5 py-2">
                    <input
                      type="time"
                      value={newStartTime || '08:30'}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full text-xs font-semibold text-[#2A2421] bg-transparent focus:outline-none tabular-nums"
                    />
                    <span className="text-[#8C8279]">–</span>
                    <input
                      type="time"
                      value={newEndTime || '10:30'}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full text-xs font-semibold text-[#2A2421] bg-transparent focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <StrictTextInput
                    mode="title_text"
                    label="Mau Kemana / Aktivitas"
                    placeholder="Contoh: Sunrise Bukit Sikunir"
                    value={newTitle}
                    onChange={setNewTitle}
                    maxLength={80}
                  />
                </div>

                <div className="lg:col-span-2">
                  <CustomSelect
                    label="Kawasan Jateng"
                    value={newCluster}
                    onChange={(v) => setNewCluster(v as JawaTengahCluster)}
                    options={CLUSTER_OPTIONS}
                  />
                </div>

                <div className="lg:col-span-2">
                  <NumericCurrencyInput
                    label="Estimasi Biaya"
                    value={newCost}
                    onChange={setNewCost}
                    placeholder="0 (Gratis / Isi nanti)"
                  />
                </div>

                <div className="lg:col-span-1">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#2A2421] py-2.5 px-3 text-xs font-bold text-white hover:bg-[#3D3530] transition-all cursor-pointer flex items-center justify-center gap-1"
                    title="Tambahkan ke Tabel"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="lg:hidden">Tambah ke Tabel</span>
                  </button>
                </div>

                {/* Second subtle line for Category & Notes */}
                <div className="lg:col-span-3">
                  <CustomSelect
                    label="Kategori Kegiatan"
                    value={newType}
                    onChange={(v) => setNewType(v as ItineraryItemType)}
                    options={ITEM_TYPE_OPTIONS}
                  />
                </div>
                <div className="lg:col-span-3">
                  <StrictTextInput
                    mode="title_text"
                    label="Detail Lokasi / Alamat"
                    placeholder="Contoh: Kejajar, Wonosobo"
                    value={newLocation}
                    onChange={setNewLocation}
                    maxLength={70}
                  />
                </div>
                <div className="lg:col-span-6">
                  <StrictTextInput
                    mode="title_text"
                    label="Catatan Spesifik"
                    placeholder="Contoh: Bawa jaket tebal, beli tiket di loket utama..."
                    value={newNotes}
                    onChange={setNewNotes}
                    maxLength={140}
                  />
                </div>
              </form>
            </BentoCard>
          ) : (
            <div className="rounded-2xl border border-[#DFD8CC] bg-[#EFECE4] px-4 py-3 flex items-center justify-between text-xs text-[#5C534C]">
              <span className="flex items-center gap-2 font-medium">
                <Eye className="h-4 w-4 text-[#8C6D53]" />
                Anda sedang melihat tabel dalam mode <strong>Hanya Lihat (Can View)</strong>. Baris
                input dan tombol hapus dinonaktifkan seperti di Canva.
              </span>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="font-bold text-[#4F5D48] underline cursor-pointer"
              >
                Ubah Mode Akses
              </button>
            </div>
          )}

          {/* MAIN INTERACTIVE ITINERARY TABLE */}
          <BentoCard variant="white" padding="none" className="overflow-visible">
            <div className="overflow-x-auto pb-12">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5DFD3] bg-[#F5F1E8] text-[11px] font-bold uppercase tracking-wider text-[#6E655E]">
                    <th className="py-3.5 pl-4 pr-1 w-11 text-center">
                      <input
                        key="master-table-select-all"
                        type="checkbox"
                        checked={Boolean(isAllSelected)}
                        ref={(el) => {
                          if (el) el.indeterminate = Boolean(isPartiallySelected);
                        }}
                        onChange={handleToggleSelectAll}
                        disabled={scheduledRows.length === 0 || currentRole === 'viewer'}
                        className="h-4 w-4 rounded border-[#DFD8CC] text-[#4F5D48] focus:ring-[#4F5D48] cursor-pointer disabled:opacity-40"
                        title={isAllSelected ? 'Batalkan pilihan' : 'Pilih semua rencana'}
                        aria-label="Pilih semua rencana"
                      />
                    </th>
                    <th className="py-3.5 pl-2 pr-3 w-22.5">Hari</th>
                    <th className="py-3.5 px-3 w-33.75">Jam (WIB)</th>
                    <th className="py-3.5 px-3 min-w-57.5">Tujuan / Mau Kemana</th>
                    <th className="py-3.5 px-3 w-38.75">Kawasan & Tipe</th>
                    <th className="py-3.5 px-3 w-37.5 text-right">Estimasi Biaya</th>
                    <th className="py-3.5 px-3 min-w-50">Catatan</th>
                    <th className="py-3.5 pl-3 pr-5 w-45 text-right">
                      Aksi Canva (Edit/Lock/Hapus)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE8DD] text-sm">
                  {scheduledRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-[#7D736B]">
                        Belum ada baris jadwal untuk filter hari ini. Gunakan baris input di atas
                        untuk menambahkan tujuan Anda.
                      </td>
                    </tr>
                  ) : (
                    scheduledRows.map((row) => {
                      const isEditing = editingRowId === row.id;
                      const isSelected = Boolean(selectedRowIds.includes(row.id));

                      if (isEditing) {
                        return (
                          <tr key={`edit-row-${row.id}`} className="bg-[#FAF6EE]">
                            <td className="py-3 pl-4 pr-1 text-center align-top">
                              <input
                                key={`edit-cb-${row.id}`}
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                disabled
                                className="h-4 w-4 rounded border-[#DFD8CC] opacity-30"
                                aria-label={`Pilihan dinonaktifkan saat mengedit ${row.title}`}
                              />
                            </td>
                            <td className="py-3 pl-2 pr-2 align-top">
                              <CustomSelect
                                variant="compact"
                                value={editDay}
                                onChange={setEditDay}
                                options={singleDayOptions}
                              />
                            </td>
                            <td className="py-3 px-2 align-top">
                              <div className="flex flex-col gap-1">
                                <input
                                  type="time"
                                  value={editStartTime || '08:00'}
                                  onChange={(e) => setEditStartTime(e.target.value)}
                                  className="rounded-lg border border-[#DFD8CC] bg-white px-2 py-1 text-xs font-semibold tabular-nums"
                                />
                                <input
                                  type="time"
                                  value={editEndTime || '10:00'}
                                  onChange={(e) => setEditEndTime(e.target.value)}
                                  className="rounded-lg border border-[#DFD8CC] bg-white px-2 py-1 text-xs font-semibold tabular-nums"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-2 align-top space-y-1.5">
                              <StrictTextInput
                                compact
                                mode="title_text"
                                value={editTitle}
                                onChange={setEditTitle}
                                placeholder="Nama tujuan"
                              />
                              <StrictTextInput
                                compact
                                mode="title_text"
                                value={editLocation}
                                onChange={setEditLocation}
                                placeholder="Lokasi spesifik"
                              />
                            </td>
                            <td className="py-3 px-2 align-top space-y-1.5">
                              <CustomSelect
                                variant="compact"
                                value={editCluster}
                                onChange={(v) => setEditCluster(v as JawaTengahCluster)}
                                options={CLUSTER_OPTIONS}
                              />
                              <CustomSelect
                                variant="compact"
                                value={editType}
                                onChange={(v) => setEditType(v as ItineraryItemType)}
                                options={ITEM_TYPE_OPTIONS}
                              />
                            </td>
                            <td className="py-3 px-2 align-top min-w-52.5 space-y-1.5">
                              <NumericCurrencyInput
                                compact
                                value={editCost}
                                onChange={setEditCost}
                                placeholder="0 (Tanpa biaya)"
                              />
                              {editCost > 0 ? (
                                <div className="space-y-1.5 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-2 text-left">
                                  <CustomSelect
                                    variant="compact"
                                    label="Yang Talangi / Bayar"
                                    value={editPaidBy || activeMember?.id || members[0]?.id || ''}
                                    onChange={setEditPaidBy}
                                    options={payerOptions}
                                  />
                                  <CustomSelect
                                    variant="compact"
                                    label="Ditanggung Oleh"
                                    value={editSplitType}
                                    onChange={(v) =>
                                      setEditSplitType(v as 'all' | 'single' | 'custom')
                                    }
                                    options={splitScopeOptions}
                                  />
                                  {editSplitType === 'custom' && (
                                    <div className="pt-1">
                                      <p className="text-[10px] font-semibold text-[#6E655E] mb-1">
                                        Pilih yang ikut patungan:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {members.map((m) => {
                                          const checked = editCustomMembers.includes(m.id);
                                          return (
                                            <button
                                              key={m.id}
                                              type="button"
                                              onClick={() => {
                                                setEditCustomMembers((prev) =>
                                                  prev.includes(m.id)
                                                    ? prev.length > 1
                                                      ? prev.filter((id) => id !== m.id)
                                                      : prev
                                                    : [...prev, m.id]
                                                );
                                              }}
                                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border cursor-pointer transition-colors ${
                                                checked
                                                  ? 'bg-[#4F5D48] text-white border-[#4F5D48]'
                                                  : 'bg-white text-[#5C534C] border-[#DFD8CC]'
                                              }`}
                                            >
                                              <span>{m.display_name.split(' ')[0]}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  <p className="text-[9px] font-semibold text-[#4F5D48] flex items-center gap-1">
                                    <span>✓ Otomatis masuk Tabel Keuangan</span>
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[10px] text-[#8C8279] italic">
                                  Tanpa biaya (Gratis / belum ditentukan)
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-2 align-top">
                              <StrictTextInput
                                compact
                                mode="title_text"
                                value={editNotes}
                                onChange={setEditNotes}
                                maxLength={150}
                                placeholder="Catatan..."
                              />
                            </td>
                            <td className="py-3 pl-2 pr-5 align-top text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => saveInlineEdit(row)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#4F5D48] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3E4A38] cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" /> Simpan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRowId(null)}
                                  className="rounded-lg border border-[#DFD8CC] bg-white p-1.5 text-[#6E655E] hover:bg-[#F3EFE6] cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={`view-row-${row.id}`}
                          className={`group transition-colors ${
                            isSelected
                              ? 'bg-[#F2ECE1] border-l-4 border-[#4F5D48]'
                              : row.is_locked
                              ? 'bg-[#FAF7F0]'
                              : 'hover:bg-[#FAF8F5]'
                          }`}
                        >
                          {/* Row Checkbox */}
                          <td className="py-3.5 pl-4 pr-1 text-center align-top">
                            <input
                              key={`view-cb-${row.id}`}
                              type="checkbox"
                              value={row.id}
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(row.id)}
                              disabled={currentRole === 'viewer'}
                              className="h-4 w-4 rounded border-[#DFD8CC] text-[#4F5D48] focus:ring-[#4F5D48] cursor-pointer disabled:opacity-40"
                              aria-label={`Pilih baris ${row.title}`}
                            />
                          </td>

                          {/* Day Badge */}
                          <td className="py-3.5 pl-2 pr-3 align-top">
                            <span className="inline-flex items-center rounded-lg bg-[#EFECE4] px-2.5 py-1 text-xs font-bold text-[#2A2421]">
                              Hari {row.day_number}
                            </span>
                          </td>

                          {/* Time Range */}
                          <td className="py-3.5 px-3 align-top">
                            <span className="text-xs font-semibold tabular-nums text-[#2A2421]">
                              {row.start_time} – {row.end_time}
                            </span>
                            <p className="text-[11px] text-[#8C8279]">WIB</p>
                          </td>

                          {/* Destination & Location */}
                          <td className="py-3.5 px-3 align-top">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-[#2A2421] leading-snug">
                                {row.title}
                              </p>
                              {row.is_locked && (
                                <span
                                  className="inline-flex items-center gap-0.5 rounded-md bg-[#E8DFCA] px-1.5 py-0.5 text-[10px] font-bold text-[#6E5634]"
                                  title="Dikunci oleh Owner"
                                >
                                  <Lock className="h-2.5 w-2.5" /> Terkunci
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#7D736B] mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-[#C46A4E] shrink-0" />
                              <span>{row.location_name}</span>
                            </p>
                          </td>

                          {/* Cluster & Category Pill */}
                          <td className="py-3.5 px-3 align-top">
                            <span className="inline-block rounded-md bg-[#EFECE4] px-2 py-0.5 text-[11px] font-semibold text-[#4A423D]">
                              {row.city_cluster}
                            </span>
                            <p className="text-[11px] text-[#7D736B] mt-1 capitalize">
                              {row.item_type === 'meal'
                                ? 'Kuliner / Makan'
                                : row.item_type === 'transit'
                                ? 'Transit Rute'
                                : row.item_type === 'stay'
                                ? 'Penginapan'
                                : 'Destinasi Wisata'}
                            </p>
                          </td>

                          {/* Estimated Cost & Financial Link Info */}
                          <td className="py-3.5 px-3 align-top text-right">
                            {row.estimated_cost <= 0 ? (
                              <span className="inline-block rounded-md bg-[#EFECE4] px-2 py-0.5 text-[11px] font-medium text-[#7D736B]">
                                Gratis / Tanpa Biaya
                              </span>
                            ) : (
                              <div>
                                <span className="font-bold text-[#2A2421] tabular-nums text-xs sm:text-sm">
                                  Rp {row.estimated_cost.toLocaleString('id-ID')}
                                </span>
                                {(() => {
                                  const linked = expenses.find((e) => e.itinerary_item_id === row.id);
                                  const payer = linked
                                    ? members.find((m) => m.id === linked.paid_by_member_id)
                                    : null;
                                  if (!linked || !payer) {
                                    return (
                                      <p className="text-[10px] text-[#8C8279] mt-0.5">
                                        Estimasi Umum
                                      </p>
                                    );
                                  }
                                  const isSingle =
                                    linked.splits.length === 1 &&
                                    linked.splits[0].member_id === linked.paid_by_member_id;
                                  const isAll = linked.splits.length === members.length;
                                  return (
                                    <div className="mt-1 flex flex-col items-end gap-0.5">
                                      <span className="inline-flex items-center gap-1 rounded bg-[#EFECE4] px-1.5 py-0.5 text-[10px] font-semibold text-[#4F5D48]">
                                        <Wallet className="h-2.5 w-2.5" />
                                        Dibayar: {payer.display_name.split(' ')[0]}
                                      </span>
                                      <span className="text-[10px] text-[#7D736B]">
                                        {isSingle
                                          ? 'Pribadi'
                                          : isAll
                                          ? `Bagi Rata (${members.length} org)`
                                          : `Patungan ${linked.splits.length} org`}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-3 align-top">
                            <p className="text-xs text-[#5C534C] leading-relaxed line-clamp-2">
                              {row.notes || '—'}
                            </p>
                          </td>

                          {/* Canva-Style Row Action Toolbar */}
                          <td className="py-3.5 pl-3 pr-5 align-top text-right">
                            {currentRole === 'viewer' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#8C8279] italic font-medium">
                                <Eye className="h-3 w-3" /> Hanya Lihat
                              </span>
                            ) : (
                              <div className="inline-flex items-center justify-end gap-1">
                                {/* Edit Row Inline */}
                                <button
                                  type="button"
                                  onClick={() => startInlineEdit(row)}
                                  className="rounded-lg border border-[#DFD8CC] bg-white p-1.5 text-[#4A423D] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                                  title="Edit baris ini"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>

                                {/* Duplicate Row (Canva style) */}
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateRow(row)}
                                  className="rounded-lg border border-[#DFD8CC] bg-white p-1.5 text-[#4A423D] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                                  title="Duplikat baris ( seperti di Canva )"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>

                                {/* Send to Split-Bill */}
                                <button
                                  type="button"
                                  onClick={() => handleSendRowToActualExpense(row)}
                                  className="rounded-lg border border-[#DFD8CC] bg-white p-1.5 text-[#4F5D48] hover:bg-[#EEF2EC] transition-colors cursor-pointer"
                                  title="Catat ke Tabel Pengeluaran Aktual (Split-Bill)"
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                </button>

                                {/* Lock/Unlock Row (Canva Padlock - Owner Only) */}
                                {currentRole === 'owner' ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleLockItineraryItem(trip.id, currentUser.email, row.id)
                                    }
                                    className={`rounded-lg border p-1.5 transition-colors cursor-pointer ${
                                      row.is_locked
                                        ? 'border-[#D4A373] bg-[#FAF0E4] text-[#8C5828]'
                                        : 'border-[#DFD8CC] bg-white text-[#7D736B] hover:bg-[#F3EFE6]'
                                    }`}
                                    title="Kunci / Buka Kunci Baris (Owner)"
                                  >
                                    {row.is_locked ? (
                                      <Lock className="h-3.5 w-3.5" />
                                    ) : (
                                      <Unlock className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                ) : row.is_locked ? (
                                  <span
                                    className="rounded-lg border border-[#D4A373] bg-[#FAF0E4] p-1.5 text-[#8C5828]"
                                    title="Baris dikunci oleh Owner"
                                  >
                                    <Lock className="h-3.5 w-3.5" />
                                  </span>
                                ) : null}

                                {/* Delete Row */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteItineraryItem(trip.id, currentUser.email, row.id)
                                  }
                                  className="rounded-lg border border-[#E8CFC8] bg-[#FDF6F4] p-1.5 text-[#C46A4E] hover:bg-[#F9E6E0] transition-colors cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#E5DFD3] bg-[#F5F1E8] text-xs font-bold text-[#2A2421]">
                    <td colSpan={5} className="py-3.5 pl-5 pr-3">
                      Total Estimasi Biaya Jadwal ({scheduledRows.length} Aktivitas)
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-sm">
                      Rp {totalEstimatedCost.toLocaleString('id-ID')}
                    </td>
                    <td colSpan={2} className="py-3.5 pl-3 pr-5 text-right text-[#6E655E] font-medium">
                      Estimasi per orang ({members.length} anggota): Rp{' '}
                      {Math.round(totalEstimatedCost / Math.max(1, members.length)).toLocaleString(
                        'id-ID'
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </BentoCard>
        </div>
      )}

      {/* =====================================================================
          SECTION 2: FINANCE & SPLIT-BILL TABLE + VISUAL CHARTS (DIAGRAM LINGKARAN & GARIS)
      ===================================================================== */}
      {activeSection === 'finance_table' && (
        <div className="space-y-6">
          {/* Pelaporan Keuangan Visual: Diagram Lingkaran, Diagram Garis, & Budget Bawaan Tiap Orang */}
          <FinancialCharts
            trip={trip}
            members={members}
            itinerary={itinerary}
            expenses={expenses}
            totalDays={totalDays}
          />

          {/* Quick Expense Input Bar */}
          {currentRole !== 'viewer' && (
            <BentoCard variant="subtle" padding="md">
              <h2 className="text-sm font-bold text-[#2A2421] mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#4F5D48]" />
                <span>Tambah Baris Pengeluaran & Split-Bill</span>
              </h2>
              <form
                onSubmit={handleAddExpenseRow}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
              >
                <div className="lg:col-span-2">
                  <CustomSelect
                    label="Hari ke-"
                    value={expDay}
                    onChange={setExpDay}
                    options={singleDayOptions}
                  />
                </div>
                <div className="lg:col-span-3">
                  <StrictTextInput
                    mode="title_text"
                    label="Nama Pengeluaran"
                    placeholder="Contoh: Sewa Mobil & BBM"
                    value={expTitle}
                    onChange={setExpTitle}
                    maxLength={80}
                  />
                </div>
                <div className="lg:col-span-2">
                  <CustomSelect
                    label="Kategori"
                    value={expCategory}
                    onChange={(v) => setExpCategory(v as ExpenseCategory)}
                    options={EXPENSE_CATEGORY_OPTIONS}
                  />
                </div>
                <div className="lg:col-span-2">
                  <NumericCurrencyInput
                    label="Nominal (Rp)"
                    value={expAmount}
                    onChange={setExpAmount}
                  />
                </div>
                <div className="lg:col-span-2">
                  <CustomSelect
                    label="Dibayar Oleh"
                    value={expPaidBy || members[0]?.id || ''}
                    onChange={setExpPaidBy}
                    options={payerOptions}
                  />
                </div>
                <div className="lg:col-span-1">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#4F5D48] py-2.5 px-3 text-xs font-bold text-white hover:bg-[#3F4B39] transition-all cursor-pointer"
                    title="Simpan Transaksi"
                  >
                    + Simpan
                  </button>
                </div>
              </form>
            </BentoCard>
          )}

          {/* Split-Bill Settlement Summary Cards (Earth Tone) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <BentoCard variant="white" padding="none" className="lg:col-span-8 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5DFD3] bg-[#F5F1E8] flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A423D]">
                  Tabel Rincian Pengeluaran Aktual ({expenses.length} Baris)
                </h3>
                <span className="text-xs font-bold text-[#4F5D48] tabular-nums">
                  Total: Rp {totalActualSpent.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#E5DFD3] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#6E655E]">
                      <th className="py-3 pl-5 pr-3">Tanggal</th>
                      <th className="py-3 px-3">Uraian Pengeluaran</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Dibayar Oleh</th>
                      <th className="py-3 px-3 text-right">Nominal (Rp)</th>
                      <th className="py-3 pl-3 pr-5 text-right">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE8DD] text-xs sm:text-sm">
                    {expenses.map((exp) => {
                      const payer = members.find((m) => m.id === exp.paid_by_member_id);
                      return (
                        <tr key={exp.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3 pl-5 pr-3 text-xs text-[#7D736B] tabular-nums">
                            {exp.incurred_at}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#2A2421]">
                            <div className="flex flex-col gap-0.5">
                              {exp.itinerary_item_id && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4F5D48] bg-[#EEF2EC] px-1.5 py-0.5 rounded w-fit">
                                  <MapPin className="h-2.5 w-2.5 text-[#C46A4E]" />
                                  Dari Jadwal Perjalanan
                                </span>
                              )}
                              <span>{exp.title}</span>
                              <p className="text-[11px] text-[#7D736B] font-normal">
                                {exp.splits.length === 1 &&
                                exp.splits[0].member_id === exp.paid_by_member_id
                                  ? `Pengeluaran Pribadi (${payer?.display_name || 'Sendiri'})`
                                  : exp.splits.length === members.length
                                  ? `Dibagi rata ${members.length} anggota (@ Rp ${Math.round(
                                      exp.amount / members.length
                                    ).toLocaleString('id-ID')})`
                                  : `Patungan ${exp.splits.length} orang (@ Rp ${Math.round(
                                      exp.amount / Math.max(1, exp.splits.length)
                                    ).toLocaleString('id-ID')})`}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-md bg-[#EFECE4] px-2 py-0.5 text-[11px] font-semibold text-[#4A423D]">
                              {CATEGORY_LABELS[exp.category]}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs font-semibold text-[#2A2421]">
                            {payer?.display_name}
                          </td>
                          <td className="py-3 px-3 text-right font-bold tabular-nums text-[#2A2421]">
                            Rp {exp.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right">
                            <button
                              type="button"
                              onClick={() => deleteExpense(trip.id, currentUser.email, exp.id)}
                              className="rounded-lg border border-[#E8CFC8] bg-[#FDF6F4] p-1.5 text-[#C46A4E] hover:bg-[#F9E6E0] cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </BentoCard>

            {/* Right: Simplified Debt Settlement & Audit Trail */}
            <div className="lg:col-span-4 space-y-5">
              <BentoCard variant="obsidian" padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#FAF8F5]">
                      Siapa Bayar ke Siapa (Split-Bill)
                    </h3>
                    <p className="text-[11px] text-[#B8AFA3]">
                      Penyederhanaan hutang otomatis {members.length} anggota
                    </p>
                  </div>
                  <Wallet className="h-4 w-4 text-[#D4A373]" />
                </div>

                <div className="space-y-2">
                  {simplifiedTransfers.length === 0 ? (
                    <p className="text-xs text-[#A3B899] py-3 text-center font-semibold">
                      Semua saldo anggota sudah impas (Lunas)!
                    </p>
                  ) : (
                    simplifiedTransfers.map((tr, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {tr.from_name} → {tr.to_name}
                          </p>
                          <p className="text-sm font-bold text-[#D4A373] tabular-nums">
                            Rp {tr.amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            recordSettlement({
                              tripId: trip.id,
                              actorEmail: currentUser.email,
                              fromMemberId: tr.from_member_id,
                              toMemberId: tr.to_member_id,
                              amount: tr.amount,
                            })
                          }
                          className="rounded-lg bg-[#4F5D48] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#5E6E56] cursor-pointer"
                        >
                          Tandai Lunas
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Mini Audit Trail */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#B8AFA3] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#A3B899]" />
                    Riwayat Keamanan Terakhir
                  </p>
                  {auditLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="text-[11px] text-[#D2C9B8] leading-snug">
                      <span className="font-semibold text-white">{log.actor_name}:</span>{' '}
                      {log.summary}
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CANVA-STYLE "BAGIKAN & IZIN AKSES (MAKS 4 ORANG)" MODAL
      ===================================================================== */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#231E1B]/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#FAF8F5] border border-[#DFD8CC] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F5D48] text-white">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2A2421]">
                    Bagikan Perjalanan Ini (Gaya Canva • Maks 4 Orang)
                  </h3>
                  <p className="text-xs text-[#6E655E]">
                    Atur siapa saja yang bisa mengedit, menghapus, atau hanya melihat tabel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg p-1.5 text-[#6E655E] hover:bg-[#EFECE4] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Invite by Email Form */}
            {members.length < 4 ? (
              <form
                onSubmit={handleInviteInModal}
                className="rounded-xl bg-white border border-[#E5DFD3] p-4 space-y-3"
              >
                <p className="text-xs font-bold text-[#2A2421]">
                  Tambah Orang via Email ({4 - members.length} kuota tersisa)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <StrictTextInput
                    compact
                    mode="email"
                    label="Alamat Email"
                    placeholder="teman@gmail.com"
                    value={inviteEmail}
                    onChange={setInviteEmail}
                  />
                  <StrictTextInput
                    compact
                    mode="person_name"
                    label="Nama Panggilan"
                    placeholder="Nama Teman"
                    value={inviteName}
                    onChange={setInviteName}
                  />
                  <NumericCurrencyInput
                    compact
                    label="Budget Bawaan"
                    value={inviteBudget}
                    onChange={setInviteBudget}
                  />
                </div>
                <div className="flex items-end gap-2.5">
                  <div className="flex-1">
                    <CustomSelect
                      label="Izin Akses"
                      value={inviteRole}
                      onChange={(v) => setInviteRole(v as 'editor' | 'viewer')}
                      options={CANVA_ROLE_OPTIONS}
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#4F5D48] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3F4B39] cursor-pointer"
                  >
                    Bagikan
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl bg-[#EFECE4] px-3.5 py-2.5 text-xs font-medium text-[#5C534C]">
                Kuota penuh (4/4 orang). Hapus salah satu anggota jika ingin mengganti email.
              </div>
            )}

            {/* People with Access List (Canva Style) + Per-Person Budget */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6E655E]">
                Orang yang Memiliki Akses & Budget Bawaan ({members.length}/4)
              </p>
              {members.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl bg-white border border-[#E5DFD3] p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: m.avatar_color || '#4F5D48' }}
                      >
                        {m.display_name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2A2421] truncate">
                          {m.display_name}
                        </p>
                        <p className="text-[11px] text-[#7D736B] truncate">{m.invited_email}</p>
                      </div>
                    </div>

                    {m.role === 'owner' ? (
                      <span className="rounded-lg bg-[#EFECE4] px-3 py-1.5 text-xs font-bold text-[#2A2421]">
                        Owner (Pemilik)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-36">
                          <CustomSelect
                            variant="compact"
                            value={m.role}
                            onChange={(nextRole) =>
                              updateMemberRole(
                                trip.id,
                                currentUser.email,
                                m.id,
                                nextRole as 'editor' | 'viewer'
                              )
                            }
                            options={[
                              { value: 'editor', label: 'Bisa Edit' },
                              { value: 'viewer', label: 'Hanya Lihat' },
                            ]}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(trip.id, currentUser.email, m.id)}
                          className="rounded-lg border border-[#E8CFC8] bg-[#FDF6F4] p-1.5 text-[#C46A4E] hover:bg-[#F9E6E0] cursor-pointer"
                          title="Cabut akses"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Per-Person Carried Budget Editor */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F2ECE1]">
                    <span className="text-[11px] font-medium text-[#6E655E]">
                      Budget dibawa oleh {m.display_name}:
                    </span>
                    <div className="w-44">
                      <NumericCurrencyInput
                        compact
                        value={m.personal_budget || 0}
                        onChange={(val) => updateMemberPersonalBudget(trip.id, m.id, val)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle Single-User Role Preview Toggle */}
            <div className="rounded-xl border border-[#DFD8CC] bg-[#EFECE4] p-3.5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C534C]">
                Pratinjau Tampilan Kolaborator (Untuk Pengujian Anda)
              </p>
              <p className="text-[11px] text-[#6E655E]">
                Ingin melihat bagaimana tabel terkunci saat dibuka oleh teman Anda yang berstatus
                Editor atau Viewer? Pilih di bawah ini:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {members.map((m) => {
                  const active =
                    m.invited_email.toLowerCase() === currentUser.email.toLowerCase();
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => switchEmailSession(m.invited_email)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#2A2421] text-white'
                          : 'bg-white text-[#4A423D] border border-[#DFD8CC] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      Lihat sbg {m.display_name} ({m.role.toUpperCase()})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

