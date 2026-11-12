'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/layout/navbar';
import { PageTransition } from '@/components/layout/page-transition';
import { BentoCard } from '@/components/ui/bento-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { NumericCurrencyInput } from '@/components/ui/numeric-currency-input';
import { StrictTextInput } from '@/components/ui/strict-text-input';
import { DotMatrixProgress } from '@/components/ui/dot-matrix-progress';
import { useAuth } from '@/lib/auth/context';
import { isValidEmailFormat, normalizeEmail } from '@/lib/auth/demo-users';
import { useTripStore } from '@/lib/store/trip-store';
import {
  calculateRecommendedCategoryBudgets,
  JAWA_TENGAH_CLUSTERS_INFO,
} from '@/lib/presets/jawa-tengah';
import {
  JawaTengahCluster,
  PrimaryTransport,
  TravelVibe,
  TripPace,
} from '@/types/database';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  Compass,
  Mail,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanionDraft {
  email: string;
  displayName: string;
  role: 'editor' | 'viewer';
  personalBudget: number;
}

const ROLE_SELECT_OPTIONS = [
  { value: 'editor', label: 'Bisa Edit (Can Edit)' },
  { value: 'viewer', label: 'Hanya Lihat (Can View)' },
];

const VEHICLE_OPTIONS: Array<{
  id: PrimaryTransport;
  title: string;
  desc: string;
  defaultNote: string;
}> = [
  {
    id: 'mobil_pribadi',
    title: 'Mobil Pribadi (Via Tol Trans-Jawa)',
    desc: 'Hitung estimasi BBM & saldo E-Toll PP',
    defaultNote: 'Mobil Pribadi via Tol Trans-Jawa PP',
  },
  {
    id: 'rental_mobil',
    title: 'Sewa Mobil / Rental + BBM',
    desc: 'Sewa harian lepas kunci atau dengan driver',
    defaultNote: 'Sewa Mobil Harian + BBM Jawa Tengah',
  },
  {
    id: 'kereta_sewa',
    title: 'Kereta Api PP + Sewa Kendaraan Lokal',
    desc: 'Turun Stasiun Tawang / Solo Balapan / Tugu',
    defaultNote: 'Tiket Kereta Api PP + Sewa Motor/Mobil Lokal',
  },
  {
    id: 'umum_travel',
    title: 'Bus Eksekutif / Shuttle Travel PP',
    desc: 'Antar-jemput titik kota di Jawa Tengah',
    defaultNote: 'Shuttle Travel / Bus Eksekutif PP',
  },
  {
    id: 'motor_touring',
    title: 'Motor / Touring Jalur Tengah & Pantura',
    desc: 'Hemat biaya & fleksibel di jalur pegunungan Dieng',
    defaultNote: 'Touring Motor Jalur Provinsi Jawa Tengah',
  },
];

export default function NewTripOnboardingPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { createTripFromOnboarding } = useTripStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Where & When
  const [title, setTitle] = useState('Ekspedisi Jawa Tengah & Highland');
  const [selectedClusters, setSelectedClusters] = useState<JawaTengahCluster[]>([
    'Semarang',
    'Dieng',
    'Magelang',
  ]);
  const [startDate, setStartDate] = useState('2026-12-24');
  const [endDate, setEndDate] = useState('2026-12-26');

  // Step 2: Berapa Orang, Kendaraan Apa, & Gaya Perjalanan
  const [participantCount, setParticipantCount] = useState<1 | 2 | 3 | 4>(4);
  const [transport, setTransport] = useState<PrimaryTransport>('mobil_pribadi');
  const [vehicleDetails, setVehicleDetails] = useState(
    'Mobil Pribadi via Tol Trans-Jawa PP'
  );
  const [vibe, setVibe] = useState<TravelVibe>('alam');
  const [pace, setPace] = useState<TripPace>('seimbang');

  // Step 3: Budget Bawaan Tiap Orang & Pertanyaan Tiket PP dll
  const [ownerBudget, setOwnerBudget] = useState<number>(2500000);
  const [includesReturnTicket, setIncludesReturnTicket] = useState<boolean>(true);
  const [returnTicketEstimate, setReturnTicketEstimate] = useState<number>(1200000);
  const [includesLodging, setIncludesLodging] = useState<boolean>(true);
  const [includesEntranceTickets, setIncludesEntranceTickets] = useState<boolean>(true);
  const [includesEmergencyFund, setIncludesEmergencyFund] = useState<boolean>(true);

  // Step 4: Companion Slots (automatically sized to participantCount - 1)
  const [companions, setCompanions] = useState<CompanionDraft[]>([
    {
      email: 'andi.pratama@gmail.com',
      displayName: 'Andi Pratama',
      role: 'editor',
      personalBudget: 2500000,
    },
    {
      email: 'budi.santoso@gmail.com',
      displayName: 'Budi Santoso',
      role: 'editor',
      personalBudget: 2500000,
    },
    {
      email: 'citra.lestari@gmail.com',
      displayName: 'Citra Lestari',
      role: 'viewer',
      personalBudget: 2000000,
    },
  ]);

  // Keep companion slots synchronized with participantCount (1..4)
  useEffect(() => {
    const neededCompanions = participantCount - 1;
    setCompanions((prev) => {
      if (prev.length === neededCompanions) return prev;
      if (prev.length > neededCompanions) {
        return prev.slice(0, neededCompanions);
      }
      const defaultComps = [
        {
          email: 'andi.pratama@gmail.com',
          displayName: 'Andi Pratama',
          role: 'editor' as const,
          personalBudget: 2500000,
        },
        {
          email: 'budi.santoso@gmail.com',
          displayName: 'Budi Santoso',
          role: 'editor' as const,
          personalBudget: 2500000,
        },
        {
          email: 'citra.lestari@gmail.com',
          displayName: 'Citra Lestari',
          role: 'viewer' as const,
          personalBudget: 2000000,
        },
      ];
      const next = [...prev];
      while (next.length < neededCompanions) {
        const fallback = defaultComps[next.length] || {
          email: `teman${next.length + 1}@gmail.com`,
          displayName: `Rekan ${next.length + 1}`,
          role: 'editor' as const,
          personalBudget: 2000000,
        };
        next.push(fallback);
      }
      return next;
    });
  }, [participantCount]);

  const totalGroupBudget =
    ownerBudget + companions.reduce((sum, c) => sum + (c.personalBudget || 0), 0);

  const categoryBreakdown = calculateRecommendedCategoryBudgets(
    totalGroupBudget,
    vibe,
    transport === 'rental_mobil' || transport === 'motor_touring'
      ? 'mobil_pribadi'
      : transport
  );

  const toggleCluster = (clusterId: JawaTengahCluster) => {
    setSelectedClusters((prev) =>
      prev.includes(clusterId)
        ? prev.length > 1
          ? prev.filter((c) => c !== clusterId)
          : prev
        : [...prev, clusterId]
    );
  };

  const handleCompanionChange = (
    idx: number,
    field: keyof CompanionDraft,
    val: string | number
  ) => {
    setCompanions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (title.trim().length < 2) {
        toast.error('Judul Perjalanan Wajib Diisi (minimal 2 karakter)');
        return;
      }
      if (!startDate || !endDate) {
        toast.error('Pilih Tanggal Mulai dan Selesai');
        return;
      }
      if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
        toast.error('Tanggal Selesai Tidak Boleh Sebelum Tanggal Mulai');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (totalGroupBudget <= 0) {
        toast.error('Masukkan Budget Bawaan Minimal Lebih dari Rp 0');
        return;
      }
      if (
        includesReturnTicket &&
        returnTicketEstimate > 0 &&
        returnTicketEstimate > totalGroupBudget
      ) {
        toast.error('Estimasi Tiket PP Melebihi Total Budget', {
          description: 'Sesuaikan estimasi tiket PP atau tambah budget bawaan peserta.',
        });
        return;
      }
      setStep(4);
    }
  };

  const handleFinishOnboarding = () => {
    if (title.trim().length < 2) {
      toast.error('Judul Perjalanan Wajib Diisi');
      setStep(1);
      return;
    }

    if (participantCount > 1) {
      const ownerEmailNorm = normalizeEmail(currentUser.email);
      const seen = new Set<string>();

      for (let i = 0; i < companions.length; i++) {
        const c = companions[i];
        if (!c.displayName.trim()) {
          toast.error(`Nama Peserta #${i + 2} Belum Diisi`, {
            description: 'Masukkan nama rekan perjalanan Anda.',
          });
          return;
        }
        const cleanEmail = normalizeEmail(c.email);
        if (!cleanEmail || !isValidEmailFormat(cleanEmail)) {
          toast.error(`Email Peserta #${i + 2} Tidak Valid`, {
            description: `Periksa penulisan email: ${c.email || '(kosong)'}`,
          });
          return;
        }
        if (cleanEmail === ownerEmailNorm) {
          toast.error(`Email Peserta #${i + 2} Sama dengan Email Anda`, {
            description: 'Gunakan email rekan yang berbeda dari email akun login Anda.',
          });
          return;
        }
        if (seen.has(cleanEmail)) {
          toast.error(`Email Peserta #${i + 2} Duplikat`, {
            description: 'Setiap rekan harus memiliki alamat email yang berbeda.',
          });
          return;
        }
        seen.add(cleanEmail);
      }
    }

    const vibeScores = {
      alam: vibe === 'alam' ? 95 : 75,
      kuliner: vibe === 'kuliner' ? 95 : 80,
      heritage: vibe === 'heritage' ? 95 : 75,
      relax: vibe === 'relax' ? 95 : 70,
    };

    const createdTripId = createTripFromOnboarding({
      title,
      startDate,
      endDate,
      totalBudgetPlan: totalGroupBudget,
      ownerEmail: currentUser.email,
      ownerName: currentUser.full_name,
      ownerPersonalBudget: ownerBudget,
      ownerBankInfo: currentUser.bank_info,
      invitedCompanions: participantCount === 1 ? [] : companions,
      answers: {
        clusters: selectedClusters,
        vibe,
        pace,
        transport,
        vibeScores,
        categoryBudgetPlan: categoryBreakdown,
        budgetInclusion: {
          includesReturnTicket,
          returnTicketEstimate: includesReturnTicket ? returnTicketEstimate : 0,
          includesLodging,
          includesEntranceTickets,
          includesEmergencyFund,
          vehicleDetails: vehicleDetails.trim() || 'Kendaraan Grup',
          participantCount,
        },
      },
    });

    if (createdTripId) {
      router.push(`/trips/${createdTripId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] pb-24 md:pb-14">
      <TopNavbar />

      <PageTransition className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFECE4] border border-[#DFD8CC] px-3 py-1 text-xs font-semibold text-[#4F5D48]">
            <Sparkles className="h-3.5 w-3.5" />
            Kuesioner Perencanaan Spesifik • Langkah {step} dari 4
          </span>
          <h1 className="mt-2.5 text-2xl sm:text-4xl font-bold tracking-tight text-[#2A2421]">
            Rencanakan Trip{' '}
            <span className="font-serif-editorial italic font-normal text-[#4F5D48]">
              Jawa Tengah Anda
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6E655E] max-w-xl mx-auto">
            Tentukan tujuan, kendaraan yang dipakai, jumlah peserta, serta budget bawaan tiap
            orang (termasuk tiket PP & penginapan).
          </p>

          <div className="mt-6 grid grid-cols-4 gap-2 max-w-xl mx-auto">
            {[
              { num: 1, label: 'Tujuan & Waktu' },
              { num: 2, label: 'Kendaraan & Orang' },
              { num: 3, label: 'Budget & Tiket PP' },
              { num: 4, label: 'Akses Tim Canva' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step) setStep(s.num as 1 | 2 | 3 | 4);
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div
                  className={`h-2 w-full rounded-full transition-all ${
                    s.num <= step ? 'bg-[#4F5D48]' : 'bg-[#DFD8CC]'
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold ${
                    s.num === step ? 'text-[#2A2421]' : 'text-[#8C8279]'
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================
            STEP 1: KAWASAN JAWA TENGAH & TANGGAL
        =================================================================== */}
        {step === 1 && (
          <BentoCard variant="white" padding="lg" className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#EDE8DD] pb-4">
              <Compass className="h-5 w-5 text-[#4F5D48]" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#2A2421]">
                  1. Pilih Kawasan Jawa Tengah & Tanggal Perjalanan
                </h2>
                <p className="text-xs text-[#6E655E]">
                  Pilih koridor kota yang ingin dimasukkan ke tabel jadwal awal Anda
                </p>
              </div>
            </div>

            <StrictTextInput
              id="trip-title"
              mode="title_text"
              label="Nama Rencana Perjalanan"
              placeholder="Contoh: Roadtrip Jawa Tengah Akhir Tahun"
              value={title}
              onChange={setTitle}
              maxLength={60}
              required
            />

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-2.5">
                Pilih Kawasan Jawa Tengah ({selectedClusters.length} dipilih)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {JAWA_TENGAH_CLUSTERS_INFO.map((c) => {
                  const isSelected = selectedClusters.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCluster(c.id)}
                      className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#4F5D48] bg-[#4F5D48] text-white shadow-xs'
                          : 'border-[#DFD8CC] bg-white text-[#2A2421] hover:border-[#B8AFA3]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#EFECE4] text-[#5C534C]'
                          }`}
                        >
                          {c.elevation_or_stat}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p
                        className={`text-[11px] mt-1 line-clamp-2 ${
                          isSelected ? 'text-[#E5DFD3]' : 'text-[#6E655E]'
                        }`}
                      >
                        {c.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-1.5">
                  Tanggal Mulai Trip
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD8CC] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#2A2421] focus:border-[#4F5D48] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-1.5">
                  Tanggal Selesai Trip
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-[#DFD8CC] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#2A2421] focus:border-[#4F5D48] focus:outline-none"
                />
              </div>
            </div>
          </BentoCard>
        )}

        {/* ===================================================================
            STEP 2: BERAPA ORANG & MENGGUNAKAN KENDARAAN APA
        =================================================================== */}
        {step === 2 && (
          <BentoCard variant="white" padding="lg" className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#EDE8DD] pb-4">
              <Car className="h-5 w-5 text-[#4F5D48]" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#2A2421]">
                  2. Jumlah Peserta Trip & Kendaraan yang Digunakan
                </h2>
                <p className="text-xs text-[#6E655E]">
                  Menentukan pembagian kursi kolaborator dan perhitungan biaya transportasi
                </p>
              </div>
            </div>

            {/* Pertanyaan 1: Tripnya berapa orang? */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-2">
                Trip Ini Berapa Orang? (Maksimal 4 Orang)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 1 as const, label: '1 Orang (Solo)', sub: 'Perjalanan Pribadi' },
                  { count: 2 as const, label: '2 Orang (Duo)', sub: 'Anda + 1 Rekan' },
                  { count: 3 as const, label: '3 Orang (Trio)', sub: 'Anda + 2 Rekan' },
                  { count: 4 as const, label: '4 Orang (Squad)', sub: 'Anda + 3 Rekan (Maks)' },
                ].map((opt) => (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setParticipantCount(opt.count)}
                    className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      participantCount === opt.count
                        ? 'border-[#4F5D48] bg-[#4F5D48] text-white shadow-xs'
                        : 'border-[#DFD8CC] bg-white text-[#2A2421] hover:border-[#B8AFA3]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">{opt.label}</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        participantCount === opt.count ? 'text-[#E5DFD3]' : 'text-[#6E655E]'
                      }`}
                    >
                      {opt.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pertanyaan 2: Menggunakan Kendaraan Apa? */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-2">
                Menggunakan Kendaraan Apa?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VEHICLE_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setTransport(v.id);
                      setVehicleDetails(v.defaultNote);
                    }}
                    className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      transport === v.id
                        ? 'border-[#2A2421] bg-[#2A2421] text-white'
                        : 'border-[#DFD8CC] bg-white text-[#2A2421] hover:border-[#B8AFA3]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">{v.title}</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        transport === v.id ? 'text-[#D2C9B8]' : 'text-[#6E655E]'
                      }`}
                    >
                      {v.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <StrictTextInput
              mode="title_text"
              label="Detail Spesifik Kendaraan / Kereta (Opsional)"
              placeholder="Contoh: Innova Zenix via Tol Trans-Jawa / KA Taksaka Eksekutif PP"
              value={vehicleDetails}
              onChange={setVehicleDetails}
              maxLength={80}
            />

            {/* Fokus Aktivitas & Ritme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EDE8DD]">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-2">
                  Fokus Gaya Perjalanan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'alam' as const, label: 'Alam & Gunung' },
                    { id: 'kuliner' as const, label: 'Wisata Kuliner' },
                    { id: 'heritage' as const, label: 'Heritage Candi' },
                    { id: 'relax' as const, label: 'Santai / Chill' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVibe(v.id)}
                      className={`rounded-xl border py-2.5 px-3 text-xs font-bold cursor-pointer ${
                        vibe === v.id
                          ? 'border-[#4F5D48] bg-[#4F5D48] text-white'
                          : 'border-[#DFD8CC] bg-white text-[#2A2421]'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-2">
                  Ritme Jadwal Harian
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'santai' as const, label: 'Santai' },
                    { id: 'seimbang' as const, label: 'Seimbang' },
                    { id: 'padat' as const, label: 'Padat' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id)}
                      className={`rounded-xl border py-2.5 px-2 text-xs font-bold cursor-pointer ${
                        pace === p.id
                          ? 'border-[#2A2421] bg-[#2A2421] text-white'
                          : 'border-[#DFD8CC] bg-white text-[#2A2421]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* ===================================================================
            STEP 3: BUDGET BAWAAN TIAP ORANG & CAKUPAN TIKET PP DLL
        =================================================================== */}
        {step === 3 && (
          <BentoCard variant="white" padding="lg" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE8DD] pb-4">
              <div className="flex items-center gap-2.5">
                <Wallet className="h-5 w-5 text-[#4F5D48]" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#2A2421]">
                    3. Budget Bawaan Tiap Orang & Cakupan Tiket PP
                  </h2>
                  <p className="text-xs text-[#6E655E]">
                    Masukkan budget yang dibawa masing-masing peserta ({participantCount} orang)
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-[#4F5D48] px-4 py-2 text-white">
                <p className="text-[10px] uppercase tracking-wider text-[#E5DFD3]">
                  Total Dana Terkumpul
                </p>
                <p className="text-sm font-bold tabular-nums">
                  Rp {totalGroupBudget.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Input Budget Tiap Orang (1 s/d participantCount) */}
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E]">
                Berapa Budget yang Dibawa Masing-Masing Orang? (Hanya Angka Rupiah)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Orang 1 (Owner) */}
                <div className="rounded-xl border border-[#DFD8CC] bg-[#FAF8F5] p-3.5">
                  <NumericCurrencyInput
                    label={`1. ${currentUser.full_name} (Anda)`}
                    value={ownerBudget}
                    onChange={setOwnerBudget}
                  />
                </div>

                {/* Orang 2..N */}
                {companions.map((comp, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#DFD8CC] bg-[#FAF8F5] p-3.5"
                  >
                    <NumericCurrencyInput
                      label={`${idx + 2}. ${
                        comp.displayName.trim() || `Peserta #${idx + 2}`
                      }`}
                      value={comp.personalBudget}
                      onChange={(val) =>
                        handleCompanionChange(idx, 'personalBudget', val)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pertanyaan Cakupan Budget: Apakah sudah termasuk Tiket PP dll? */}
            <div className="rounded-xl border border-[#DFD8CC] bg-[#FAF8F5] p-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2A2421]">
                Apakah Budget di Atas Sudah Termasuk Biaya Berikut?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-2.5 rounded-xl bg-white border border-[#E5DFD3] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesReturnTicket}
                    onChange={(e) => setIncludesReturnTicket(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#4F5D48]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#2A2421]">
                      Sudah Termasuk Tiket PP / BBM & Tol PP
                    </p>
                    <p className="text-[11px] text-[#6E655E]">
                      Otomatis dicatat sebagai alokasi transport utama pulang-pergi
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 rounded-xl bg-white border border-[#E5DFD3] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesLodging}
                    onChange={(e) => setIncludesLodging(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#4F5D48]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#2A2421]">
                      Sudah Termasuk Penginapan / Hotel / Villa
                    </p>
                    <p className="text-[11px] text-[#6E655E]">
                      Mengalokasikan porsi budget untuk akomodasi malam
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 rounded-xl bg-white border border-[#E5DFD3] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesEntranceTickets}
                    onChange={(e) => setIncludesEntranceTickets(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#4F5D48]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#2A2421]">
                      Sudah Termasuk Tiket Masuk Wisata & Candi
                    </p>
                    <p className="text-[11px] text-[#6E655E]">
                      Termasuk tiket Borobudur, Dieng, Prambanan, dll.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 rounded-xl bg-white border border-[#E5DFD3] p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesEmergencyFund}
                    onChange={(e) => setIncludesEmergencyFund(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#4F5D48]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#2A2421]">
                      Sudah Termasuk Dana Darurat & Oleh-Oleh
                    </p>
                    <p className="text-[11px] text-[#6E655E]">
                      Menyisihkan cadangan tak terduga selama di perjalanan
                    </p>
                  </div>
                </label>
              </div>

              {includesReturnTicket && (
                <div className="pt-2">
                  <NumericCurrencyInput
                    label={`Estimasi Biaya Tiket PP / BBM & Tol PP (${vehicleDetails})`}
                    value={returnTicketEstimate}
                    onChange={setReturnTicketEstimate}
                    helperText="Otomatis masuk ke laporan pengeluaran Transportasi Utama grup."
                  />
                </div>
              )}
            </div>

            {/* Pratinjau Proporsi Kategori */}
            <div className="rounded-xl bg-white border border-[#E5DFD3] p-4 space-y-2">
              <p className="text-xs font-bold text-[#2A2421]">
                Estimasi Pembagian Pos Anggaran dari Rp{' '}
                {totalGroupBudget.toLocaleString('id-ID')}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                <DotMatrixProgress
                  label="Penginapan"
                  value={
                    totalGroupBudget > 0
                      ? Math.round((categoryBreakdown.lodging / totalGroupBudget) * 100)
                      : 0
                  }
                  rightText={`Rp ${(categoryBreakdown.lodging / 1000).toLocaleString('id-ID')}rb`}
                  tone="obsidian"
                />
                <DotMatrixProgress
                  label="Transport & PP"
                  value={
                    totalGroupBudget > 0
                      ? Math.round((categoryBreakdown.transport / totalGroupBudget) * 100)
                      : 0
                  }
                  rightText={`Rp ${(categoryBreakdown.transport / 1000).toLocaleString('id-ID')}rb`}
                  tone="emerald"
                />
                <DotMatrixProgress
                  label="Kuliner"
                  value={
                    totalGroupBudget > 0
                      ? Math.round((categoryBreakdown.food / totalGroupBudget) * 100)
                      : 0
                  }
                  rightText={`Rp ${(categoryBreakdown.food / 1000).toLocaleString('id-ID')}rb`}
                  tone="amber"
                />
                <DotMatrixProgress
                  label="Tiket Wisata"
                  value={
                    totalGroupBudget > 0
                      ? Math.round((categoryBreakdown.tickets / totalGroupBudget) * 100)
                      : 0
                  }
                  rightText={`Rp ${(categoryBreakdown.tickets / 1000).toLocaleString('id-ID')}rb`}
                  tone="rose"
                />
              </div>
            </div>
          </BentoCard>
        )}

        {/* ===================================================================
            STEP 4: DATA EMAIL REKAN & IZIN CANVA
        =================================================================== */}
        {step === 4 && (
          <BentoCard variant="white" padding="lg" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE8DD] pb-4">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-[#4F5D48]" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#2A2421]">
                    4. Konfirmasi Peserta & Izin Akses Tabel ({participantCount} Orang)
                  </h2>
                  <p className="text-xs text-[#6E655E]">
                    Atur email rekan dan izin akses mereka seperti di Canva (Bisa Edit / Hanya Lihat)
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-[#2A2421] px-3 py-1 text-xs font-bold text-white">
                Total Dana: Rp {totalGroupBudget.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Peserta 1 (Owner) */}
            <div className="rounded-xl border border-[#4F5D48]/30 bg-[#EEF2EC] p-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F5D48] text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <p className="text-sm font-bold text-[#2A2421]">
                    {currentUser.full_name} (Anda — Owner)
                  </p>
                  <p className="text-xs text-[#5C534C]">
                    {currentUser.email} • Budget Bawaan: Rp{' '}
                    {ownerBudget.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-[#4F5D48] px-3 py-1 text-[11px] font-bold uppercase text-white">
                Owner
              </span>
            </div>

            {participantCount === 1 ? (
              <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] p-4 text-center text-xs text-[#5C534C]">
                Anda memilih <strong>1 Orang (Solo Trip)</strong>. Anda tetap bisa mengundang
                hingga 3 rekan kapan saja lewat tombol <strong>Bagikan</strong> di halaman
                Tabel Dashboard.
              </div>
            ) : (
              <div className="space-y-3">
                {companions.map((comp, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#DFD8CC] bg-[#FAF8F5] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6E655E] flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Peserta #{index + 2}
                      </span>
                      <span className="text-xs font-bold text-[#4F5D48] tabular-nums">
                        Budget Bawaan: Rp {comp.personalBudget.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <StrictTextInput
                          mode="person_name"
                          label="Nama Panggilan (Huruf)"
                          placeholder="Andi Pratama"
                          value={comp.displayName}
                          onChange={(val) =>
                            handleCompanionChange(index, 'displayName', val)
                          }
                          maxLength={40}
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <StrictTextInput
                          mode="email"
                          label="Email Login Teman"
                          placeholder="teman@gmail.com"
                          value={comp.email}
                          onChange={(val) => handleCompanionChange(index, 'email', val)}
                          maxLength={70}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <CustomSelect
                          label="Izin Canva"
                          value={comp.role}
                          onChange={(val) =>
                            handleCompanionChange(
                              index,
                              'role',
                              val as 'editor' | 'viewer'
                            )
                          }
                          options={ROLE_SELECT_OPTIONS}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BentoCard>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DFD8CC] bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#4A423D] hover:bg-[#EFECE4] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2A2421] px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#3D3530] transition-all cursor-pointer"
            >
              <span>Lanjut ke Langkah {step + 1}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F5D48] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#3F4B39] transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Buat Tabel Itinerary & Grafik Keuangan</span>
            </button>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
