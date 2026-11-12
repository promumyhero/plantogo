'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Expense,
  ExpenseAuditLog,
  ExpenseCategory,
  ItineraryItem,
  OnboardingAnswers,
  Settlement,
  SplitType,
  Trip,
  TripMember,
  TripMemberRole,
} from '@/types/database';
import {
  calculateRecommendedCategoryBudgets,
  generateHybridItinerary,
} from '@/lib/presets/jawa-tengah';
import {
  calculateExpenseSplits,
  SplitParticipantInput,
} from '@/lib/split-bill/calculator';
import {
  canAddOrEditItineraryItem,
  canManageMembers,
  canMutateFinances,
  canToggleItineraryLock,
  MAX_TRIP_MEMBERS,
} from '@/lib/rbac/guards';
import {
  isValidEmailFormat,
  isValidPersonName,
  normalizeEmail,
} from '@/lib/auth/demo-users';
import { toast } from 'sonner';

export interface CompleteTripBundle {
  trip: Trip;
  members: TripMember[];
  itinerary: ItineraryItem[];
  expenses: Expense[];
  settlements: Settlement[];
  auditLogs: ExpenseAuditLog[];
}

const STORAGE_TRIPS_KEY = 'plantogo_trips_bundle_v2';

function createInitialSeedBundle(): CompleteTripBundle[] {
  const tripId = 'jateng-expedition-2026';
  const defaultBudget = 10_000_000;
  const categoryBudgetPlan = calculateRecommendedCategoryBudgets(
    defaultBudget,
    'alam',
    'mobil_pribadi'
  );

  const answers: OnboardingAnswers = {
    clusters: ['Semarang', 'Dieng', 'Magelang'],
    vibe: 'alam',
    pace: 'seimbang',
    transport: 'mobil_pribadi',
    vibeScores: {
      alam: 92,
      kuliner: 85,
      heritage: 80,
      relax: 74,
    },
    categoryBudgetPlan,
    budgetInclusion: {
      includesReturnTicket: true,
      returnTicketEstimate: 1200000,
      includesLodging: true,
      includesEntranceTickets: true,
      includesEmergencyFund: true,
      vehicleDetails: 'Mobil Pribadi (Innova Reborn) via Tol Trans-Jawa PP',
      participantCount: 4,
    },
  };

  const members: TripMember[] = [
    {
      id: 'mem-ridho',
      trip_id: tripId,
      user_id: 'user-owner-ridho',
      invited_email: 'ridho@plantogo.id',
      display_name: 'Ridho Hery',
      role: 'owner',
      invite_status: 'active',
      personal_budget: 3000000,
      bank_info: 'BCA 8820194812 a/n Ridho Hery',
      avatar_color: '#4F5D48',
      created_at: '2026-11-09T08:00:00.000Z',
    },
    {
      id: 'mem-andi',
      trip_id: tripId,
      user_id: 'user-editor-andi',
      invited_email: 'andi.pratama@gmail.com',
      display_name: 'Andi Pratama',
      role: 'editor',
      invite_status: 'active',
      personal_budget: 2500000,
      bank_info: 'Mandiri 137009281721 a/n Andi Pratama',
      avatar_color: '#C46A4E',
      created_at: '2026-11-09T08:05:00.000Z',
    },
    {
      id: 'mem-budi',
      trip_id: tripId,
      user_id: 'user-editor-budi',
      invited_email: 'budi.santoso@gmail.com',
      display_name: 'Budi Santoso',
      role: 'editor',
      invite_status: 'active',
      personal_budget: 2500000,
      bank_info: 'BNI 0918273645 a/n Budi Santoso',
      avatar_color: '#8C6D53',
      created_at: '2026-11-09T08:10:00.000Z',
    },
    {
      id: 'mem-citra',
      trip_id: tripId,
      user_id: null,
      invited_email: 'citra.lestari@gmail.com',
      display_name: 'Citra Lestari',
      role: 'viewer',
      invite_status: 'pending',
      personal_budget: 2000000,
      bank_info: 'SeaBank 90128371625 a/n Citra Lestari',
      avatar_color: '#B58B61',
      created_at: '2026-11-09T08:15:00.000Z',
    },
  ];

  const itinerary = generateHybridItinerary({
    tripId,
    creatorMemberId: 'mem-ridho',
    startDate: '2026-12-18',
    endDate: '2026-12-20',
    answers,
  });

  const exp1Splits = calculateExpenseSplits(
    'exp-seed-1',
    1800000,
    'equal',
    members.map((m) => ({ member_id: m.id }))
  );

  const exp2Splits = calculateExpenseSplits(
    'exp-seed-2',
    1200000,
    'equal',
    members.map((m) => ({ member_id: m.id }))
  );

  const exp3Splits = calculateExpenseSplits(
    'exp-seed-3',
    480000,
    'equal',
    members.map((m) => ({ member_id: m.id }))
  );

  const exp4Splits = calculateExpenseSplits(
    'exp-seed-4',
    600000,
    'equal',
    members.map((m) => ({ member_id: m.id }))
  );

  const expenses: Expense[] = [
    {
      id: 'exp-seed-1',
      trip_id: tripId,
      itinerary_item_id: null,
      title: 'Villa Kabut Dieng & Glamping Borobudur (2 Malam)',
      category: 'lodging',
      amount: 1800000,
      paid_by_member_id: 'mem-ridho',
      split_type: 'equal',
      splits: exp1Splits,
      incurred_at: '2026-12-18',
      day_number: 1,
      created_by_member_id: 'mem-ridho',
      updated_at: '2026-11-09T09:00:00.000Z',
    },
    {
      id: 'exp-seed-2',
      trip_id: tripId,
      itinerary_item_id: null,
      title: 'Biaya BBM Full Tank & E-Toll Trans-Jawa PP',
      category: 'transport',
      amount: 1200000,
      paid_by_member_id: 'mem-andi',
      split_type: 'equal',
      splits: exp2Splits,
      incurred_at: '2026-12-18',
      day_number: 1,
      created_by_member_id: 'mem-andi',
      updated_at: '2026-11-09T09:30:00.000Z',
    },
    {
      id: 'exp-seed-3',
      trip_id: tripId,
      itinerary_item_id: itinerary[0]?.id || null,
      title: 'Kuliner Lumpia Gang Lombok, Mie Ongklok & Kopi',
      category: 'food',
      amount: 480000,
      paid_by_member_id: 'mem-budi',
      split_type: 'equal',
      splits: exp3Splits,
      incurred_at: '2026-12-19',
      day_number: 2,
      created_by_member_id: 'mem-budi',
      updated_at: '2026-11-09T10:00:00.000Z',
    },
    {
      id: 'exp-seed-4',
      trip_id: tripId,
      itinerary_item_id: null,
      title: 'Tiket Naik Struktur Candi Borobudur & Sikunir (4 Orang)',
      category: 'tickets',
      amount: 600000,
      paid_by_member_id: 'mem-ridho',
      split_type: 'equal',
      splits: exp4Splits,
      incurred_at: '2026-12-20',
      day_number: 3,
      created_by_member_id: 'mem-ridho',
      updated_at: '2026-11-09T11:00:00.000Z',
    },
  ];

  const auditLogs: ExpenseAuditLog[] = [
    {
      id: 'audit-seed-1',
      trip_id: tripId,
      expense_id: 'exp-seed-1',
      actor_email: 'ridho@plantogo.id',
      actor_name: 'Ridho Hery',
      action: 'CREATE',
      summary: 'Mencatat Penginapan Villa Dieng & Borobudur Rp 1.800.000 (Bagi Rata 4 orang)',
      previous_data: null,
      new_data: { amount: 1800000, split_type: 'equal' },
      created_at: '2026-11-09T09:00:00.000Z',
    },
    {
      id: 'audit-seed-2',
      trip_id: tripId,
      expense_id: 'exp-seed-2',
      actor_email: 'andi.pratama@gmail.com',
      actor_name: 'Andi Pratama',
      action: 'CREATE',
      summary: 'Mencatat BBM & E-Toll Trans-Jawa PP Rp 1.200.000 (Bagi Rata 4 orang)',
      previous_data: null,
      new_data: { amount: 1200000, split_type: 'equal' },
      created_at: '2026-11-09T09:30:00.000Z',
    },
  ];

  return [
    {
      trip: {
        id: tripId,
        owner_id: 'user-owner-ridho',
        title: 'Ekspedisi Jawa Tengah: Semarang, Dieng & Borobudur',
        region: 'Jawa Tengah',
        start_date: '2026-12-18',
        end_date: '2026-12-20',
        total_budget_plan: defaultBudget,
        onboarding_answers: answers,
        created_at: '2026-11-09T08:00:00.000Z',
      },
      members,
      itinerary,
      expenses,
      settlements: [],
      auditLogs,
    },
  ];
}

// Defensive sanitizer so legacy localStorage data never crashes any component
function sanitizeLoadedBundles(raw: CompleteTripBundle[]): CompleteTripBundle[] {
  return (Array.isArray(raw) ? raw : []).map((b) => {
    const safeMembers = Array.isArray(b.members)
      ? b.members.map((m) => ({
          ...m,
          id: m.id || `mem-${Math.random().toString(36).slice(2, 7)}`,
          display_name: m.display_name || 'Peserta',
          invited_email: m.invited_email || 'peserta@plantogo.id',
          role: m.role || 'viewer',
          personal_budget:
            typeof m.personal_budget === 'number' && m.personal_budget > 0
              ? m.personal_budget
              : Math.round((b.trip?.total_budget_plan || 8000000) / Math.max(1, b.members.length)),
        }))
      : [];

    const safeAnswers: OnboardingAnswers = {
      clusters: b.trip?.onboarding_answers?.clusters || ['Semarang', 'Dieng', 'Magelang'],
      vibe: b.trip?.onboarding_answers?.vibe || 'alam',
      pace: b.trip?.onboarding_answers?.pace || 'seimbang',
      transport: b.trip?.onboarding_answers?.transport || 'mobil_pribadi',
      vibeScores: b.trip?.onboarding_answers?.vibeScores || {
        alam: 90,
        kuliner: 80,
        heritage: 80,
        relax: 75,
      },
      categoryBudgetPlan:
        b.trip?.onboarding_answers?.categoryBudgetPlan ||
        calculateRecommendedCategoryBudgets(
          b.trip?.total_budget_plan || 8000000,
          'alam',
          'mobil_pribadi'
        ),
      budgetInclusion: b.trip?.onboarding_answers?.budgetInclusion || {
        includesReturnTicket: true,
        returnTicketEstimate: 1000000,
        includesLodging: true,
        includesEntranceTickets: true,
        includesEmergencyFund: true,
        vehicleDetails: 'Mobil Pribadi via Tol Trans-Jawa',
        participantCount: safeMembers.length || 4,
      },
    };

    const safeStartDate =
      b.trip?.start_date && !Number.isNaN(new Date(b.trip.start_date).getTime())
        ? b.trip.start_date
        : '2026-12-24';
    const safeEndDate =
      b.trip?.end_date && !Number.isNaN(new Date(b.trip.end_date).getTime())
        ? b.trip.end_date
        : '2026-12-26';

    const safeExpenses = Array.isArray(b.expenses)
      ? b.expenses.map((e) => ({
          ...e,
          id: e.id || `exp-${Math.random().toString(36).slice(2, 7)}`,
          amount: typeof e.amount === 'number' && Number.isFinite(e.amount) ? e.amount : 0,
          day_number: typeof e.day_number === 'number' && e.day_number > 0 ? e.day_number : 1,
          incurred_at: e.incurred_at || safeStartDate,
          splits: Array.isArray(e.splits) ? e.splits : [],
        }))
      : [];

    const safeItinerary = Array.isArray(b.itinerary)
      ? b.itinerary.map((i) => ({
          ...i,
          id: i.id || `item-${Math.random().toString(36).slice(2, 7)}`,
          estimated_cost:
            typeof i.estimated_cost === 'number' && Number.isFinite(i.estimated_cost)
              ? i.estimated_cost
              : 0,
          day_number: typeof i.day_number === 'number' && i.day_number > 0 ? i.day_number : 1,
          status: i.status || 'scheduled',
          is_locked: Boolean(i.is_locked),
        }))
      : [];

    return {
      trip: {
        ...b.trip,
        id: b.trip?.id || 'jateng-expedition-2026',
        title: b.trip?.title || 'Ekspedisi Jawa Tengah',
        start_date: safeStartDate,
        end_date: safeEndDate,
        total_budget_plan:
          typeof b.trip?.total_budget_plan === 'number' && Number.isFinite(b.trip.total_budget_plan)
            ? b.trip.total_budget_plan
            : 8000000,
        onboarding_answers: safeAnswers,
      },
      members: safeMembers,
      itinerary: safeItinerary,
      expenses: safeExpenses,
      settlements: Array.isArray(b.settlements) ? b.settlements : [],
      auditLogs: Array.isArray(b.auditLogs) ? b.auditLogs : [],
    };
  });
}

export interface CreateTripInput {
  title: string;
  startDate: string;
  endDate: string;
  totalBudgetPlan: number;
  answers: OnboardingAnswers;
  ownerEmail: string;
  ownerName: string;
  ownerPersonalBudget?: number;
  ownerBankInfo?: string;
  invitedCompanions: Array<{
    email: string;
    displayName: string;
    role: 'editor' | 'viewer';
    personalBudget?: number;
  }>;
}

interface TripStoreContextValue {
  bundles: CompleteTripBundle[];
  isLoaded: boolean;
  getBundleById: (tripId: string) => CompleteTripBundle | undefined;
  getActiveMemberForTrip: (tripId: string, activeEmail: string) => TripMember | null;
  createTripFromOnboarding: (input: CreateTripInput) => string | null;
  addOrUpdateItineraryItem: (
    tripId: string,
    actorEmail: string,
    item: Omit<ItineraryItem, 'id' | 'trip_id' | 'created_at' | 'created_by'> & { id?: string }
  ) => boolean;
  deleteItineraryItem: (tripId: string, actorEmail: string, itemId: string) => boolean;
  bulkDeleteItineraryItems: (
    tripId: string,
    actorEmail: string,
    itemIds: string[]
  ) => { deletedCount: number; blockedCount: number };
  clearAllItineraryItems: (tripId: string, actorEmail: string) => boolean;
  toggleLockItineraryItem: (tripId: string, actorEmail: string, itemId: string) => boolean;
  promoteWishlistToSchedule: (
    tripId: string,
    actorEmail: string,
    itemId: string,
    dayNumber: number
  ) => boolean;
  inviteMemberByEmail: (
    tripId: string,
    actorEmail: string,
    invitedEmail: string,
    displayName: string,
    role: 'editor' | 'viewer',
    personalBudget?: number
  ) => boolean;
  updateMemberRole: (
    tripId: string,
    actorEmail: string,
    memberId: string,
    newRole: 'editor' | 'viewer'
  ) => boolean;
  updateMemberPersonalBudget: (
    tripId: string,
    memberId: string,
    newBudget: number
  ) => void;
  removeMember: (tripId: string, actorEmail: string, memberId: string) => boolean;
  addExpenseWithSplits: (params: {
    tripId: string;
    actorEmail: string;
    title: string;
    category: ExpenseCategory;
    amount: number;
    paidByMemberId: string;
    splitType: SplitType;
    participants: SplitParticipantInput[];
    itineraryItemId?: string | null;
    incurredAt?: string;
    dayNumber?: number;
  }) => boolean;
  deleteExpense: (tripId: string, actorEmail: string, expenseId: string) => boolean;
  recordSettlement: (params: {
    tripId: string,
    actorEmail: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    notes?: string;
  }) => boolean;
  autoActivatePendingEmail: (email: string, userId: string) => void;
}

const TripStoreContext = createContext<TripStoreContextValue | undefined>(undefined);

export function TripStoreProvider({ children }: { children: React.ReactNode }) {
  const [bundles, setBundles] = useState<CompleteTripBundle[]>(() => createInitialSeedBundle());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRIPS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CompleteTripBundle[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBundles(sanitizeLoadedBundles(parsed));
        }
      }
    } catch {
      // fallback to clean seed
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persist = useCallback((nextBundles: CompleteTripBundle[]) => {
    setBundles(nextBundles);
    try {
      localStorage.setItem(STORAGE_TRIPS_KEY, JSON.stringify(nextBundles));
    } catch {
      // ignore
    }
  }, []);

  const getBundleById = useCallback(
    (tripId: string) => bundles.find((b) => b.trip.id === tripId),
    [bundles]
  );

  const getActiveMemberForTrip = useCallback(
    (tripId: string, activeEmail: string): TripMember | null => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return null;
      const clean = normalizeEmail(activeEmail);
      return bundle.members.find((m) => normalizeEmail(m.invited_email) === clean) || null;
    },
    [bundles]
  );

  const autoActivatePendingEmail = useCallback(
    (email: string, userId: string) => {
      const clean = normalizeEmail(email);
      let changed = false;
      const next = bundles.map((b) => {
        const updatedMembers = b.members.map((m) => {
          if (normalizeEmail(m.invited_email) === clean && m.invite_status === 'pending') {
            changed = true;
            return {
              ...m,
              user_id: userId,
              invite_status: 'active' as const,
            };
          }
          return m;
        });
        return changed ? { ...b, members: updatedMembers } : b;
      });
      if (changed) {
        persist(next);
      }
    },
    [bundles, persist]
  );

  const createTripFromOnboarding = useCallback(
    (input: CreateTripInput): string | null => {
      const cleanTitle = input.title.trim();
      if (cleanTitle.length < 2) {
        toast.error('Judul Perjalanan Terlalu Pendek');
        return null;
      }

      if (input.invitedCompanions.length > 3) {
        toast.error('Melebihi Batas 4 Kolaborator');
        return null;
      }

      const tripId = `trip-${Date.now()}`;
      const ownerMemberId = `mem-${tripId}-owner`;
      const colors = ['#4F5D48', '#C46A4E', '#8C6D53', '#B58B61'];

      const defaultShare = Math.round(
        input.totalBudgetPlan / Math.max(1, 1 + input.invitedCompanions.length)
      );

      const members: TripMember[] = [
        {
          id: ownerMemberId,
          trip_id: tripId,
          user_id: 'owner-active',
          invited_email: normalizeEmail(input.ownerEmail),
          display_name: input.ownerName.trim(),
          role: 'owner',
          invite_status: 'active',
          personal_budget: input.ownerPersonalBudget ?? defaultShare,
          bank_info: input.ownerBankInfo,
          avatar_color: colors[0],
          created_at: new Date().toISOString(),
        },
      ];

      for (let i = 0; i < input.invitedCompanions.length; i++) {
        const comp = input.invitedCompanions[i];
        const cleanEmail = normalizeEmail(comp.email);
        if (!cleanEmail) continue;

        if (!isValidEmailFormat(cleanEmail)) {
          toast.error(`Email Peserta #${i + 2} Tidak Valid`, {
            description: `Periksa penulisan email: ${comp.email}`,
          });
          return null;
        }
        if (!isValidPersonName(comp.displayName)) {
          toast.error(`Nama Peserta #${i + 2} Hanya Boleh Huruf`);
          return null;
        }
        if (members.some((m) => normalizeEmail(m.invited_email) === cleanEmail)) {
          toast.error('Email Duplikat', {
            description: `Email ${cleanEmail} sudah dimasukkan dalam daftar tim.`,
          });
          return null;
        }

        members.push({
          id: `mem-${tripId}-${i + 1}`,
          trip_id: tripId,
          user_id: null,
          invited_email: cleanEmail,
          display_name: comp.displayName.trim(),
          role: comp.role,
          invite_status: 'pending',
          personal_budget: comp.personalBudget ?? defaultShare,
          avatar_color: colors[(i + 1) % colors.length],
          created_at: new Date().toISOString(),
        });
      }

      const itinerary = generateHybridItinerary({
        tripId,
        creatorMemberId: ownerMemberId,
        startDate: input.startDate,
        endDate: input.endDate,
        answers: input.answers,
      });

      const initialExpenses: Expense[] = [];
      const inclusion = input.answers.budgetInclusion;
      if (inclusion?.includesReturnTicket && inclusion.returnTicketEstimate > 0) {
        const expId = `exp-${tripId}-pp`;
        const ppSplits = calculateExpenseSplits(
          expId,
          inclusion.returnTicketEstimate,
          'equal',
          members.map((m) => ({ member_id: m.id }))
        );
        initialExpenses.push({
          id: expId,
          trip_id: tripId,
          itinerary_item_id: null,
          title: `Tiket PP / BBM & Tol (${inclusion.vehicleDetails || 'Transport Utama'})`,
          category: 'transport',
          amount: inclusion.returnTicketEstimate,
          paid_by_member_id: ownerMemberId,
          split_type: 'equal',
          splits: ppSplits,
          incurred_at: input.startDate,
          day_number: 1,
          created_by_member_id: ownerMemberId,
          updated_at: new Date().toISOString(),
        });
      }

      const newBundle: CompleteTripBundle = {
        trip: {
          id: tripId,
          owner_id: ownerMemberId,
          title: cleanTitle,
          region: 'Jawa Tengah',
          start_date: input.startDate,
          end_date: input.endDate,
          total_budget_plan: Math.max(0, Math.floor(input.totalBudgetPlan)),
          onboarding_answers: input.answers,
          created_at: new Date().toISOString(),
        },
        members,
        itinerary,
        expenses: initialExpenses,
        settlements: [],
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            trip_id: tripId,
            expense_id: null,
            actor_email: normalizeEmail(input.ownerEmail),
            actor_name: input.ownerName.trim(),
            action: 'CREATE',
            summary: `Membuat perjalanan "${cleanTitle}" (${members.length} orang, total dana Rp ${input.totalBudgetPlan.toLocaleString('id-ID')}).`,
            previous_data: null,
            new_data: { total_budget_plan: input.totalBudgetPlan, members_count: members.length },
            created_at: new Date().toISOString(),
          },
        ],
      };

      persist([newBundle, ...bundles]);
      toast.success('Tabel Perjalanan Berhasil Dibuat!');
      return tripId;
    },
    [bundles, persist]
  );

  const addOrUpdateItineraryItem = useCallback(
    (
      tripId: string,
      actorEmail: string,
      itemInput: Omit<ItineraryItem, 'id' | 'trip_id' | 'created_at' | 'created_by'> & {
        id?: string;
      }
    ): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const existingItem = itemInput.id
        ? bundle.itinerary.find((i) => i.id === itemInput.id)
        : undefined;

      const perm = canAddOrEditItineraryItem(
        actor?.role || null,
        existingItem ? existingItem.is_locked : false
      );
      if (!perm.allowed) {
        toast.error('Izin Ditolak', { description: perm.reason });
        return false;
      }

      let nextItinerary: ItineraryItem[];
      if (existingItem) {
        nextItinerary = bundle.itinerary.map((i) =>
          i.id === existingItem.id
            ? {
                ...existingItem,
                ...itemInput,
                id: existingItem.id,
                estimated_cost: Math.max(0, Math.floor(itemInput.estimated_cost)),
              }
            : i
        );
        toast.success('Baris Tabel Diperbarui');
      } else {
        const created: ItineraryItem = {
          ...itemInput,
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          trip_id: tripId,
          estimated_cost: Math.max(0, Math.floor(itemInput.estimated_cost)),
          created_by: actor?.id || 'system',
          created_at: new Date().toISOString(),
        };
        nextItinerary = [...bundle.itinerary, created];
        toast.success('Baris Baru Masuk ke Tabel Jadwal');
      }

      persist(
        bundles.map((b) => (b.trip.id === tripId ? { ...b, itinerary: nextItinerary } : b))
      );
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const deleteItineraryItem = useCallback(
    (tripId: string, actorEmail: string, itemId: string): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const target = bundle.itinerary.find((i) => i.id === itemId);
      if (!target) return false;

      const perm = canAddOrEditItineraryItem(actor?.role || null, target.is_locked);
      if (!perm.allowed) {
        toast.error('Tidak Dapat Menghapus Baris', { description: perm.reason });
        return false;
      }

      const nextItinerary = bundle.itinerary.filter((i) => i.id !== itemId);
      persist(
        bundles.map((b) => (b.trip.id === tripId ? { ...b, itinerary: nextItinerary } : b))
      );
      toast.success('Baris Dihapus dari Tabel');
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const bulkDeleteItineraryItems = useCallback(
    (
      tripId: string,
      actorEmail: string,
      itemIds: string[]
    ): { deletedCount: number; blockedCount: number } => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle || itemIds.length === 0) return { deletedCount: 0, blockedCount: 0 };

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      if (!actor || actor.role === 'viewer') {
        toast.error('Izin Ditolak', {
          description: 'Role Viewer (Hanya Lihat) tidak memiliki izin menghapus rencana.',
        });
        return { deletedCount: 0, blockedCount: itemIds.length };
      }

      const isOwner = actor.role === 'owner';
      let deletedCount = 0;
      let blockedCount = 0;

      const idsToDelete = new Set<string>();
      bundle.itinerary.forEach((item) => {
        if (itemIds.includes(item.id)) {
          if (item.is_locked && !isOwner) {
            blockedCount++;
          } else {
            idsToDelete.add(item.id);
            deletedCount++;
          }
        }
      });

      if (deletedCount > 0) {
        const nextItinerary = bundle.itinerary.filter((i) => !idsToDelete.has(i.id));
        persist(
          bundles.map((b) => (b.trip.id === tripId ? { ...b, itinerary: nextItinerary } : b))
        );
        toast.success(`${deletedCount} rencana berhasil dihapus sekaligus!`);
      }

      if (blockedCount > 0) {
        toast.warning(`${blockedCount} baris terkunci oleh Owner tidak dihapus.`);
      }

      return { deletedCount, blockedCount };
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const clearAllItineraryItems = useCallback(
    (tripId: string, actorEmail: string): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      if (!actor || actor.role === 'viewer') {
        toast.error('Izin Ditolak', {
          description: 'Role Viewer tidak dapat menghapus rencana.',
        });
        return false;
      }

      const isOwner = actor.role === 'owner';
      const remaining = isOwner ? [] : bundle.itinerary.filter((i) => i.is_locked);
      const deletedCount = bundle.itinerary.length - remaining.length;

      persist(
        bundles.map((b) => (b.trip.id === tripId ? { ...b, itinerary: remaining } : b))
      );

      toast.success(
        isOwner
          ? 'Seluruh rencana perjalanan telah dihapus bersih.'
          : `${deletedCount} rencana berhasil dihapus (baris terkunci tetap disimpan).`
      );
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const toggleLockItineraryItem = useCallback(
    (tripId: string, actorEmail: string, itemId: string): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const perm = canToggleItineraryLock(actor?.role || null);
      if (!perm.allowed) {
        toast.error('Khusus Owner', { description: perm.reason });
        return false;
      }

      let nextState = false;
      const nextItinerary = bundle.itinerary.map((i) => {
        if (i.id === itemId) {
          nextState = !i.is_locked;
          return { ...i, is_locked: nextState };
        }
        return i;
      });

      persist(
        bundles.map((b) => (b.trip.id === tripId ? { ...b, itinerary: nextItinerary } : b))
      );

      toast.success(nextState ? 'Baris Dikunci (Locked)' : 'Kunci Baris Dibuka');
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const promoteWishlistToSchedule = useCallback(
    (tripId: string, actorEmail: string, itemId: string, dayNumber: number): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const perm = canAddOrEditItineraryItem(actor?.role || null, false);
      if (!perm.allowed) {
        toast.error('Izin Ditolak', { description: perm.reason });
        return false;
      }

      const nextItinerary = bundle.itinerary.map((i) =>
        i.id === itemId
          ? { ...i, status: 'scheduled' as const, day_number: dayNumber }
          : i
      );

      persist(
        bundles.map((b) => (b.trip.id === tripId ? { ...b, itinerary: nextItinerary } : b))
      );
      toast.success(`Dimasukkan ke Hari ${dayNumber}`);
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const inviteMemberByEmail = useCallback(
    (
      tripId: string,
      actorEmail: string,
      invitedEmail: string,
      displayName: string,
      role: 'editor' | 'viewer',
      personalBudget?: number
    ): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const perm = canManageMembers(actor?.role || null, bundle.members.length, 'invite');
      if (!perm.allowed) {
        toast.error('Gagal Menambah Anggota', { description: perm.reason });
        return false;
      }

      const cleanEmail = normalizeEmail(invitedEmail);
      if (!isValidEmailFormat(cleanEmail)) {
        toast.error('Format Email Tidak Valid');
        return false;
      }

      if (!isValidPersonName(displayName)) {
        toast.error('Nama Hanya Boleh Huruf');
        return false;
      }

      if (bundle.members.some((m) => normalizeEmail(m.invited_email) === cleanEmail)) {
        toast.error('Email Sudah Terdaftar');
        return false;
      }

      const colors = ['#4F5D48', '#C46A4E', '#8C6D53', '#B58B61'];
      const budgetToSet =
        typeof personalBudget === 'number' && personalBudget > 0
          ? personalBudget
          : Math.round(bundle.trip.total_budget_plan / Math.max(1, bundle.members.length + 1));

      const newMember: TripMember = {
        id: `mem-${Date.now()}`,
        trip_id: tripId,
        user_id: null,
        invited_email: cleanEmail,
        display_name: displayName.trim(),
        role,
        invite_status: 'pending',
        personal_budget: budgetToSet,
        avatar_color: colors[bundle.members.length % colors.length],
        created_at: new Date().toISOString(),
      };

      const nextMembers = [...bundle.members, newMember];
      const nextTotalBudget = nextMembers.reduce((s, m) => s + (m.personal_budget || 0), 0);

      persist(
        bundles.map((b) =>
          b.trip.id === tripId
            ? {
                ...b,
                trip: { ...b.trip, total_budget_plan: nextTotalBudget },
                members: nextMembers,
              }
            : b
        )
      );

      toast.success(`${newMember.display_name} Diundang (${nextMembers.length}/${MAX_TRIP_MEMBERS})`);
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const updateMemberRole = useCallback(
    (
      tripId: string,
      actorEmail: string,
      memberId: string,
      newRole: 'editor' | 'viewer'
    ): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const perm = canManageMembers(actor?.role || null, bundle.members.length, 'change_role');
      if (!perm.allowed) {
        toast.error('Akses Ditolak', { description: perm.reason });
        return false;
      }

      const target = bundle.members.find((m) => m.id === memberId);
      if (!target || target.role === 'owner') return false;

      const nextMembers = bundle.members.map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m
      );
      persist(
        bundles.map((b) => (b.trip.id === tripId ? { ...b, members: nextMembers } : b))
      );

      toast.success('Izin Akses Diperbarui');
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const updateMemberPersonalBudget = useCallback(
    (tripId: string, memberId: string, newBudget: number) => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return;

      const clean = Math.max(0, Math.floor(newBudget));
      const nextMembers = bundle.members.map((m) =>
        m.id === memberId ? { ...m, personal_budget: clean } : m
      );
      const nextTotal = nextMembers.reduce((s, m) => s + (m.personal_budget || 0), 0);

      persist(
        bundles.map((b) =>
          b.trip.id === tripId
            ? {
                ...b,
                trip: { ...b.trip, total_budget_plan: nextTotal },
                members: nextMembers,
              }
            : b
        )
      );
    },
    [bundles, persist]
  );

  const removeMember = useCallback(
    (tripId: string, actorEmail: string, memberId: string): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const perm = canManageMembers(actor?.role || null, bundle.members.length, 'remove');
      if (!perm.allowed) {
        toast.error('Akses Ditolak', { description: perm.reason });
        return false;
      }

      const target = bundle.members.find((m) => m.id === memberId);
      if (!target || target.role === 'owner') return false;

      const involvedInExpenses = bundle.expenses.some(
        (e) =>
          e.paid_by_member_id === memberId ||
          e.splits.some((s) => s.member_id === memberId && s.share_amount > 0)
      );

      if (involvedInExpenses) {
        toast.error('Anggota Tercatat di Split-Bill', {
          description: `Ubah izin ${target.display_name} menjadi Hanya Lihat (Viewer).`,
        });
        return false;
      }

      const nextMembers = bundle.members.filter((m) => m.id !== memberId);
      const nextTotal = nextMembers.reduce((s, m) => s + (m.personal_budget || 0), 0);

      persist(
        bundles.map((b) =>
          b.trip.id === tripId
            ? {
                ...b,
                trip: { ...b.trip, total_budget_plan: nextTotal },
                members: nextMembers,
              }
            : b
        )
      );

      toast.success('Akses Anggota Dicabut');
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const addExpenseWithSplits = useCallback(
    (params: {
      tripId: string;
      actorEmail: string;
      title: string;
      category: ExpenseCategory;
      amount: number;
      paidByMemberId: string;
      splitType: SplitType;
      participants: SplitParticipantInput[];
      itineraryItemId?: string | null;
      incurredAt?: string;
      dayNumber?: number;
    }): boolean => {
      const bundle = bundles.find((b) => b.trip.id === params.tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(params.tripId, params.actorEmail);
      const perm = canMutateFinances(actor?.role || null);
      if (!perm.allowed) {
        toast.error('Akses Keuangan Ditolak', { description: perm.reason });
        return false;
      }

      const cleanTitle = params.title.trim();
      const cleanAmount = Math.floor(params.amount);

      if (!cleanTitle) {
        toast.error('Nama Pengeluaran Wajib Diisi');
        return false;
      }
      if (cleanAmount <= 0) {
        toast.error('Nominal Harus Lebih dari Rp 0');
        return false;
      }

      const expenseId = `exp-${Date.now()}`;
      let splits;
      try {
        splits = calculateExpenseSplits(
          expenseId,
          cleanAmount,
          params.splitType,
          params.participants
        );
      } catch (err) {
        toast.error('Perhitungan Split-Bill Gagal', {
          description: err instanceof Error ? err.message : 'Periksa kembali pembagian nominal.',
        });
        return false;
      }

      const newExpense: Expense = {
        id: expenseId,
        trip_id: params.tripId,
        itinerary_item_id: params.itineraryItemId || null,
        title: cleanTitle,
        category: params.category,
        amount: cleanAmount,
        paid_by_member_id: params.paidByMemberId,
        split_type: params.splitType,
        splits,
        incurred_at: params.incurredAt || bundle.trip.start_date,
        day_number: params.dayNumber || 1,
        created_by_member_id: actor?.id || params.paidByMemberId,
        updated_at: new Date().toISOString(),
      };

      const payer = bundle.members.find((m) => m.id === params.paidByMemberId);
      const newAudit: ExpenseAuditLog = {
        id: `audit-${Date.now()}`,
        trip_id: params.tripId,
        expense_id: expenseId,
        actor_email: actor?.invited_email || normalizeEmail(params.actorEmail),
        actor_name: actor?.display_name || 'Member',
        action: 'CREATE',
        summary: `Menambah pengeluaran "${cleanTitle}" Rp ${cleanAmount.toLocaleString('id-ID')} (Dibayar oleh ${payer?.display_name || 'Member'})`,
        previous_data: null,
        new_data: {
          title: cleanTitle,
          amount: cleanAmount,
          category: params.category,
          split_type: params.splitType,
        },
        created_at: new Date().toISOString(),
      };

      const nextItinerary = params.itineraryItemId
        ? bundle.itinerary.map((item) =>
            item.id === params.itineraryItemId
              ? { ...item, status: 'completed' as const }
              : item
          )
        : bundle.itinerary;

      persist(
        bundles.map((b) =>
          b.trip.id === params.tripId
            ? {
                ...b,
                itinerary: nextItinerary,
                expenses: [newExpense, ...b.expenses],
                auditLogs: [newAudit, ...b.auditLogs],
              }
            : b
        )
      );

      toast.success('Tersimpan di Tabel Keuangan & Grafik!');
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const deleteExpense = useCallback(
    (tripId: string, actorEmail: string, expenseId: string): boolean => {
      const bundle = bundles.find((b) => b.trip.id === tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(tripId, actorEmail);
      const perm = canMutateFinances(actor?.role || null);
      if (!perm.allowed) {
        toast.error('Izin Ditolak', { description: perm.reason });
        return false;
      }

      const target = bundle.expenses.find((e) => e.id === expenseId);
      if (!target) return false;

      const auditEntry: ExpenseAuditLog = {
        id: `audit-${Date.now()}`,
        trip_id: tripId,
        expense_id: expenseId,
        actor_email: actor?.invited_email || normalizeEmail(actorEmail),
        actor_name: actor?.display_name || 'Member',
        action: 'DELETE',
        summary: `Menghapus transaksi "${target.title}" Rp ${target.amount.toLocaleString('id-ID')}`,
        previous_data: { title: target.title, amount: target.amount },
        new_data: null,
        created_at: new Date().toISOString(),
      };

      persist(
        bundles.map((b) =>
          b.trip.id === tripId
            ? {
                ...b,
                expenses: b.expenses.filter((e) => e.id !== expenseId),
                auditLogs: [auditEntry, ...b.auditLogs],
              }
            : b
        )
      );

      toast.success('Transaksi Dihapus');
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  const recordSettlement = useCallback(
    (params: {
      tripId: string;
      actorEmail: string;
      fromMemberId: string;
      toMemberId: string;
      amount: number;
      notes?: string;
    }): boolean => {
      const bundle = bundles.find((b) => b.trip.id === params.tripId);
      if (!bundle) return false;

      const actor = getActiveMemberForTrip(params.tripId, params.actorEmail);
      const perm = canMutateFinances(actor?.role || null);
      if (!perm.allowed) {
        toast.error('Izin Ditolak', { description: perm.reason });
        return false;
      }

      const fromMem = bundle.members.find((m) => m.id === params.fromMemberId);
      const toMem = bundle.members.find((m) => m.id === params.toMemberId);
      if (!fromMem || !toMem) return false;

      const cleanAmount = Math.max(0, Math.floor(params.amount));
      const newSettlement: Settlement = {
        id: `settle-${Date.now()}`,
        trip_id: params.tripId,
        from_member_id: params.fromMemberId,
        to_member_id: params.toMemberId,
        amount: cleanAmount,
        settled_at: new Date().toISOString(),
        notes: params.notes,
      };

      const auditEntry: ExpenseAuditLog = {
        id: `audit-${Date.now()}`,
        trip_id: params.tripId,
        expense_id: null,
        actor_email: actor?.invited_email || normalizeEmail(params.actorEmail),
        actor_name: actor?.display_name || 'Member',
        action: 'SETTLE',
        summary: `Pelunasan: ${fromMem.display_name} membayar Rp ${cleanAmount.toLocaleString('id-ID')} ke ${toMem.display_name}`,
        previous_data: null,
        new_data: { amount: cleanAmount },
        created_at: new Date().toISOString(),
      };

      persist(
        bundles.map((b) =>
          b.trip.id === params.tripId
            ? {
                ...b,
                settlements: [newSettlement, ...b.settlements],
                auditLogs: [auditEntry, ...b.auditLogs],
              }
            : b
        )
      );

      toast.success('Pelunasan Dicatat!');
      return true;
    },
    [bundles, getActiveMemberForTrip, persist]
  );

  return (
    <TripStoreContext.Provider
      value={{
        bundles,
        isLoaded,
        getBundleById,
        getActiveMemberForTrip,
        createTripFromOnboarding,
        addOrUpdateItineraryItem,
        deleteItineraryItem,
        bulkDeleteItineraryItems,
        clearAllItineraryItems,
        toggleLockItineraryItem,
        promoteWishlistToSchedule,
        inviteMemberByEmail,
        updateMemberRole,
        updateMemberPersonalBudget,
        removeMember,
        addExpenseWithSplits,
        deleteExpense,
        recordSettlement,
        autoActivatePendingEmail,
      }}
    >
      {children}
    </TripStoreContext.Provider>
  );
}

export function useTripStore() {
  const ctx = useContext(TripStoreContext);
  if (!ctx) {
    throw new Error('useTripStore must be used within a TripStoreProvider');
  }
  return ctx;
}
