'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/layout/navbar';
import { EditorialFooter } from '@/components/layout/footer';
import { PageTransition } from '@/components/layout/page-transition';
import { BentoCard } from '@/components/ui/bento-card';
import { StrictTextInput } from '@/components/ui/strict-text-input';
import { useAuth } from '@/lib/auth/context';
import { EARTH_TONE_AVATAR_COLORS, normalizeEmail } from '@/lib/auth/demo-users';
import { useTripStore } from '@/lib/store/trip-store';
import {
  Calendar,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  History,
  LogOut,
  Mail,
  MapPin,
  Plus,
  Search,
  Shield,
  Ship,
  Plane,
  Car,
  Trash2,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';

export default function ProfileAndHistoryPage() {
  const router = useRouter();
  const {
    currentUser,
    availableAccounts,
    isAuthenticated,
    updateUserProfile,
    switchEmailSession,
    logout,
  } = useAuth();
  const { bundles, deleteTrip, duplicateTrip, autoActivatePendingEmail } = useTripStore();

  // Form State for Profile Edit
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [email, setEmail] = useState(currentUser.email);
  const [bankInfo, setBankInfo] = useState(currentUser.bank_info || '');
  const [shortBio, setShortBio] = useState(currentUser.shortBio || '');
  const [badgeColor, setBadgeColor] = useState(currentUser.badgeColor || '#4F5D48');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Sync local form state when switching user
  React.useEffect(() => {
    setFullName(currentUser.full_name);
    setEmail(currentUser.email);
    setBankInfo(currentUser.bank_info || '');
    setShortBio(currentUser.shortBio || '');
    setBadgeColor(currentUser.badgeColor || '#4F5D48');
  }, [currentUser]);

  // Filter & Search State for Trip History
  const [historyFilter, setHistoryFilter] = useState<'all' | 'owned' | 'invited'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Enrich trips with active user role and financial summary
  const enrichedTrips = useMemo(() => {
    const activeEmail = normalizeEmail(currentUser.email);

    return bundles.map((bundle) => {
      const memberRecord = bundle.members.find(
        (m) => normalizeEmail(m.invited_email) === activeEmail
      );
      const role = memberRecord?.role || (bundle.members[0]?.role ?? 'viewer');
      const isOwner = role === 'owner' || bundle.trip.owner_id === memberRecord?.id;

      const totalActualSpent = bundle.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const scheduledCount = bundle.itinerary.filter((i) => i.status === 'scheduled').length;
      const start = new Date(bundle.trip.start_date);
      const end = new Date(bundle.trip.end_date);
      const totalDays = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );

      return {
        bundle,
        trip: bundle.trip,
        role,
        isOwner,
        memberRecord,
        totalActualSpent,
        scheduledCount,
        totalDays,
      };
    });
  }, [bundles, currentUser.email]);

  const filteredTrips = useMemo(() => {
    return enrichedTrips.filter((item) => {
      if (historyFilter === 'owned' && !item.isOwner) return false;
      if (historyFilter === 'invited' && item.isOwner) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.trip.title.toLowerCase().includes(q);
        const matchOrigin = (item.trip.origin_city || '').toLowerCase().includes(q);
        const matchRegion = item.trip.region.toLowerCase().includes(q);
        const matchClusters = item.trip.onboarding_answers.clusters
          .join(' ')
          .toLowerCase()
          .includes(q);
        return matchTitle || matchOrigin || matchRegion || matchClusters;
      }

      return true;
    });
  }, [enrichedTrips, historyFilter, searchQuery]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalOwned = enrichedTrips.filter((t) => t.isOwner).length;
    const totalCollaborating = enrichedTrips.length;
    const totalBudgetManaged = enrichedTrips.reduce(
      (sum, t) => sum + (t.trip.total_budget_plan || 0),
      0
    );
    const totalDestinations = enrichedTrips.reduce((sum, t) => sum + t.scheduledCount, 0);

    return {
      totalOwned,
      totalCollaborating,
      totalBudgetManaged,
      totalDestinations,
    };
  }, [enrichedTrips]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = updateUserProfile({
      fullName,
      email,
      bankInfo,
      shortBio,
      badgeColor,
    });
    if (ok) {
      autoActivatePendingEmail(email, currentUser.id);
      setIsEditingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col justify-between">
      <div>
        <TopNavbar />

        <PageTransition className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* =================================================================
              PAGE HEADER: PROFIL & RIWAYAT PEMBUATAN TRIP
          ================================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DFD3] pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFECE4] border border-[#DFD8CC] px-3 py-1 text-xs font-semibold text-[#4F5D48]">
                <History className="h-3.5 w-3.5" />
                <span>Pusat Akun, Kolaborasi & Riwayat Perjalanan</span>
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2421]">
                Profil Pengguna & Riwayat Pembuatan Trip
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#6E655E]">
                Kelola identitas rekening Split-Bill Anda, pantau seluruh riwayat trip yang pernah
                dibuat, atau beralih akun kolaborator.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4F5D48] px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#3F4B39] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Trip Baru</span>
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5C5B8] bg-[#FBF3F0] px-3.5 py-2.5 text-xs font-bold text-[#B84A32] hover:bg-[#F5E3DC] transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout / Keluar</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2A2421] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3D3530] transition-all"
                >
                  <span>Login Sekarang</span>
                </Link>
              )}
            </div>
          </div>

          {/* =================================================================
              QUICK STATS ROW (Responsive 2 cols on mobile, 4 cols on desktop)
          ================================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <BentoCard variant="white" padding="md">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D736B]">
                Total Trip Tersimpan
              </p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2A2421] tabular-nums">
                {stats.totalCollaborating} Trip
              </p>
              <p className="mt-1 text-[11px] text-[#4F5D48] font-medium">
                {stats.totalOwned} sebagai Pemilik (Owner)
              </p>
            </BentoCard>

            <BentoCard variant="white" padding="md">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D736B]">
                Destinasi Terjadwal
              </p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-[#2A2421] tabular-nums">
                {stats.totalDestinations} Lokasi
              </p>
              <p className="mt-1 text-[11px] text-[#6E655E]">
                Tercatat di seluruh tabel jadwal
              </p>
            </BentoCard>

            <BentoCard variant="white" padding="md">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D736B]">
                Total Anggaran Dikelola
              </p>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-[#4F5D48] tabular-nums truncate">
                Rp {stats.totalBudgetManaged.toLocaleString('id-ID')}
              </p>
              <p className="mt-1 text-[11px] text-[#6E655E]">
                Akumulasi rencana semua trip
              </p>
            </BentoCard>

            <BentoCard variant="white" padding="md">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7D736B]">
                Status Sesi & Izin
              </p>
              <p className="mt-1 text-base sm:text-lg font-bold text-[#2A2421] truncate">
                {isAuthenticated ? currentUser.full_name : 'Mode Tamu'}
              </p>
              <p className="mt-1 text-[11px] text-[#C46A4E] font-semibold truncate">
                {currentUser.email}
              </p>
            </BentoCard>
          </div>

          {/* =================================================================
              MAIN GRID: LEFT (PROFILE & SWITCHER) + RIGHT (TRIP HISTORY)
          ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: PROFILE CARD & MULTI-USER SWITCHER (4 Cols on Desktop) */}
            <div className="lg:col-span-4 space-y-6">
              <BentoCard variant="white" padding="lg" className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-[#EDE8DD] pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: currentUser.badgeColor || '#4F5D48' }}
                    >
                      {currentUser.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-[#2A2421] truncate">
                        {currentUser.full_name}
                      </h2>
                      <p className="text-xs text-[#6E655E] truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-[#EEF2EC] px-2 py-0.5 text-[10px] font-bold text-[#4F5D48]">
                        {currentUser.shortBio || 'Pengguna Aktif'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((prev) => !prev)}
                    className="rounded-xl border border-[#DFD8CC] bg-[#FAF8F5] px-3 py-1.5 text-xs font-bold text-[#2A2421] hover:bg-[#EFECE4] transition-all shrink-0 cursor-pointer"
                  >
                    {isEditingProfile ? 'Batal' : 'Edit Profil'}
                  </button>
                </div>

                {!isEditingProfile ? (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl bg-[#FAF8F5] border border-[#EDE8DD] p-3 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D736B] flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#4F5D48]" /> Email Identitas Canva
                      </p>
                      <p className="font-semibold text-[#2A2421] break-all">{currentUser.email}</p>
                    </div>

                    <div className="rounded-xl bg-[#FAF8F5] border border-[#EDE8DD] p-3 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D736B] flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-[#C46A4E]" /> Nomor Rekening /
                        E-Wallet Split-Bill
                      </p>
                      <p className="font-semibold text-[#2A2421]">
                        {currentUser.bank_info || 'Belum diatur (Klik Edit Profil untuk mengisi)'}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="flex-1 rounded-xl bg-[#2A2421] py-2.5 px-4 text-xs font-bold text-white hover:bg-[#3D3530] transition-all cursor-pointer"
                      >
                        Perbarui Data Profil
                      </button>
                      <Link
                        href="/login"
                        className="rounded-xl border border-[#DFD8CC] bg-white py-2.5 px-3.5 text-xs font-bold text-[#4A423D] hover:bg-[#EFECE4] transition-all"
                      >
                        Halaman Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <StrictTextInput
                      mode="person_name"
                      label="Nama Lengkap (Huruf)"
                      value={fullName}
                      onChange={setFullName}
                      maxLength={50}
                      required
                    />
                    <StrictTextInput
                      mode="email"
                      label="Alamat Email Aktif"
                      value={email}
                      onChange={setEmail}
                      maxLength={80}
                      required
                    />
                    <StrictTextInput
                      mode="title_text"
                      label="Rekening Bank / E-Wallet (Untuk Split-Bill)"
                      placeholder="Contoh: BCA 8820194812 a/n Ridho"
                      value={bankInfo}
                      onChange={setBankInfo}
                      maxLength={80}
                    />
                    <StrictTextInput
                      mode="title_text"
                      label="Bio / Keterangan Singkat"
                      placeholder="Contoh: Koordinator Trip & Dokumentasi"
                      value={shortBio}
                      onChange={setShortBio}
                      maxLength={60}
                    />

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-2">
                        Warna Avatar Earth-Tone
                      </label>
                      <div className="flex items-center gap-2.5">
                        {EARTH_TONE_AVATAR_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setBadgeColor(color)}
                            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-transform cursor-pointer ${
                              badgeColor === color ? 'scale-110 ring-2 ring-[#2A2421] ring-offset-2' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {badgeColor === color && <Check className="h-4 w-4 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#4F5D48] py-2.5 px-4 text-xs font-bold text-white hover:bg-[#3F4B39] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Simpan Perubahan Profil</span>
                    </button>
                  </form>
                )}
              </BentoCard>

              {/* Simulasi Pergantian Akun Kolaborator (Canva Role Testing) */}
              <BentoCard variant="subtle" padding="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#2A2421] flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-[#4F5D48]" />
                    <span>Simulasi Akses Kolaborator (Canva)</span>
                  </p>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-[#5C534C]">
                    {availableAccounts.length} Akun
                  </span>
                </div>
                <p className="text-[11px] text-[#6E655E] leading-relaxed">
                  Klik salah satu akun di bawah untuk menguji perbedaan hak akses{' '}
                  <strong>Owner</strong>, <strong>Editor (Bisa Edit)</strong>, dan{' '}
                  <strong>Viewer (Hanya Lihat)</strong> pada tabel.
                </p>

                <div className="space-y-2 pt-1">
                  {availableAccounts.map((acc) => {
                    const isCurrent =
                      normalizeEmail(acc.email) === normalizeEmail(currentUser.email);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          switchEmailSession(acc.email);
                          autoActivatePendingEmail(acc.email, acc.id);
                        }}
                        className={`w-full rounded-xl border p-2.5 text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isCurrent
                            ? 'border-[#4F5D48] bg-white shadow-2xs'
                            : 'border-[#DFD8CC] bg-[#FAF8F5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: acc.badgeColor || '#4F5D48' }}
                          >
                            {acc.full_name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2A2421] truncate">
                              {acc.full_name}
                            </p>
                            <p className="text-[10px] text-[#7D736B] truncate">{acc.email}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            isCurrent
                              ? 'bg-[#4F5D48] text-white'
                              : 'bg-[#EFECE4] text-[#5C534C]'
                          }`}
                        >
                          {isCurrent ? 'Aktif' : 'Pilih'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </BentoCard>
            </div>

            {/* RIGHT COLUMN: RIWAYAT PEMBUATAN TRIP (8 Cols on Desktop) */}
            <div className="lg:col-span-8 space-y-4">
              <BentoCard variant="white" padding="lg" className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE8DD] pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#2A2421] flex items-center gap-2">
                      <History className="h-5 w-5 text-[#4F5D48]" />
                      <span>Riwayat Pembuatan Trip & Kolaborasi</span>
                    </h2>
                    <p className="text-xs text-[#6E655E] mt-0.5">
                      Daftar seluruh rencana perjalanan yang telah Anda buat atau diikuti beserta
                      status anggarannya
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-[#F5F1E8] p-1 rounded-xl self-start sm:self-auto">
                    {[
                      { id: 'all' as const, label: `Semua (${enrichedTrips.length})` },
                      {
                        id: 'owned' as const,
                        label: `Milik Saya (${enrichedTrips.filter((t) => t.isOwner).length})`,
                      },
                      {
                        id: 'invited' as const,
                        label: `Kolaborator (${enrichedTrips.filter((t) => !t.isOwner).length})`,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setHistoryFilter(tab.id)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          historyFilter === tab.id
                            ? 'bg-[#2A2421] text-white shadow-2xs'
                            : 'text-[#6E655E] hover:text-[#2A2421]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="h-4 w-4 text-[#8C8279] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan judul trip, kota asal (misal: Pontianak), atau kawasan (Semarang, Dieng)..."
                    className="w-full rounded-xl border border-[#DFD8CC] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#2A2421] placeholder:text-[#9C9187] focus:border-[#4F5D48] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Trip History Cards List */}
                {filteredTrips.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#DFD8CC] bg-[#FAF8F5] p-10 text-center space-y-3">
                    <p className="text-sm font-bold text-[#2A2421]">
                      Belum ada riwayat trip yang sesuai filter
                    </p>
                    <p className="text-xs text-[#6E655E] max-w-md mx-auto">
                      Mulai buat rencana perjalanan baru melalui kuesioner interaktif untuk
                      menghitung tiket PP, budget senang-senang, dan jadwal harian otomatis.
                    </p>
                    <Link
                      href="/trips/new"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#4F5D48] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3F4B39] transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Buat Trip Pertama Anda</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTrips.map((item) => {
                      const { trip, bundle, role, isOwner, totalActualSpent, scheduledCount, totalDays } =
                        item;
                      const inclusion = trip.onboarding_answers?.budgetInclusion;
                      const originCity =
                        trip.origin_city || inclusion?.originCity || 'Pontianak';
                      const transportType = trip.onboarding_answers?.transport;
                      const createdDate = new Date(trip.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });

                      return (
                        <div
                          key={trip.id}
                          className="rounded-2xl border border-[#DFD8CC] bg-[#FAF8F5] hover:bg-white p-4 sm:p-5 transition-all shadow-2xs space-y-4"
                        >
                          {/* Top Row: Title, Created Date & Role Badge */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    role === 'owner'
                                      ? 'bg-[#4F5D48] text-white'
                                      : role === 'editor'
                                      ? 'bg-[#EFECE4] text-[#2A2421] border border-[#DFD8CC]'
                                      : 'bg-[#F4EBE6] text-[#C46A4E]'
                                  }`}
                                >
                                  {role === 'owner'
                                    ? 'Owner (Pemilik)'
                                    : role === 'editor'
                                    ? 'Can Edit (Editor)'
                                    : 'Can View (Viewer)'}
                                </span>
                                <span className="text-[11px] text-[#7D736B]">
                                  Dibuat {createdDate}
                                </span>
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-[#2A2421] wrap-break-word">
                                {trip.title}
                              </h3>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <Link
                                href={`/trips/${trip.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2A2421] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#3D3530] transition-all"
                              >
                                <span>Buka Tabel</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => duplicateTrip(trip.id, currentUser.email)}
                                className="inline-flex items-center gap-1 rounded-xl border border-[#DFD8CC] bg-white px-3 py-2 text-xs font-semibold text-[#4A423D] hover:bg-[#EFECE4] transition-all cursor-pointer"
                                title="Duplikat Rencana Trip Ini"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Duplikat</span>
                              </button>

                              {isOwner && bundles.length > 1 && (
                                <>
                                  {confirmDeleteId === trip.id ? (
                                    <div className="inline-flex items-center gap-1 rounded-xl border border-[#E5C5B8] bg-[#FBF3F0] px-2.5 py-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          deleteTrip(trip.id, currentUser.email);
                                          setConfirmDeleteId(null);
                                        }}
                                        className="text-[11px] font-bold text-[#B84A32] hover:underline px-1 cursor-pointer"
                                      >
                                        Ya, Hapus
                                      </button>
                                      <span className="text-[#DFD8CC]">|</span>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="text-[11px] font-semibold text-[#6E655E] px-1 cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(trip.id)}
                                      className="inline-flex items-center justify-center rounded-xl border border-[#E5C5B8] bg-white p-2 text-[#B84A32] hover:bg-[#FBF3F0] transition-all cursor-pointer"
                                      title="Hapus Trip dari Riwayat"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Metadata Pills */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#E5DFD3] px-2.5 py-1 font-semibold text-[#2A2421]">
                              <MapPin className="h-3.5 w-3.5 text-[#C46A4E] shrink-0" />
                              <span>
                                {originCity} ➔ {trip.region} (
                                {trip.onboarding_answers.clusters.join(', ')})
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#E5DFD3] px-2.5 py-1 text-[#5C534C]">
                              <Calendar className="h-3.5 w-3.5 text-[#4F5D48] shrink-0" />
                              <span>
                                {trip.start_date} s/d {trip.end_date} ({totalDays} Hari)
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#E5DFD3] px-2.5 py-1 text-[#5C534C]">
                              {transportType === 'kapal_laut' ? (
                                <Ship className="h-3.5 w-3.5 text-[#4F5D48] shrink-0" />
                              ) : transportType === 'pesawat' ? (
                                <Plane className="h-3.5 w-3.5 text-[#4F5D48] shrink-0" />
                              ) : (
                                <Car className="h-3.5 w-3.5 text-[#4F5D48] shrink-0" />
                              )}
                              <span className="truncate max-w-60">
                                {inclusion?.vehicleDetails || transportType.replace('_', ' ')}
                              </span>
                            </span>
                          </div>

                          {/* Bottom Summary Bar: Schedule Count, Members & Budget */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#E5DFD3] text-xs">
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="text-[#7D736B]">Total Rencana:</span>
                              <span className="font-bold text-[#2A2421]">
                                {scheduledCount} Kegiatan
                              </span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="text-[#7D736B] flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" /> Tim:
                              </span>
                              <span className="font-bold text-[#2A2421]">
                                {bundle.members.length}/4 Orang
                              </span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 tabular-nums">
                              <span className="text-[#7D736B] flex items-center gap-1">
                                <Wallet className="h-3.5 w-3.5 text-[#4F5D48]" /> Budget:
                              </span>
                              <span className="font-bold text-[#4F5D48]">
                                Rp {trip.total_budget_plan.toLocaleString('id-ID')}
                              </span>
                              {totalActualSpent > 0 && (
                                <span className="text-[11px] text-[#7D736B]">
                                  (Aktual Rp {totalActualSpent.toLocaleString('id-ID')})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </BentoCard>
            </div>
          </div>
        </PageTransition>
      </div>

      <EditorialFooter />
    </div>
  );
}

