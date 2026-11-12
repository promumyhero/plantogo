'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/layout/navbar';
import { PageTransition } from '@/components/layout/page-transition';
import { BentoCard } from '@/components/ui/bento-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { DotMatrixProgress } from '@/components/ui/dot-matrix-progress';
import {
  CURATED_JAWA_TENGAH_SPOTS,
  JAWA_TENGAH_CLUSTERS_INFO,
} from '@/lib/presets/jawa-tengah';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Table2,
  Users,
  Wallet,
} from 'lucide-react';

const VIBE_SELECT_OPTIONS = [
  { value: 'alam', label: 'Alam, Gunung & Sunrise' },
  { value: 'kuliner', label: 'Wisata Kuliner & Kopi Lokal' },
  { value: 'heritage', label: 'Heritage, Candi & Budaya' },
  { value: 'relax', label: 'Slow Travel & Staycation' },
];

const CLUSTER_SELECT_OPTIONS = [
  { value: 'dieng_magelang', label: 'Semarang – Dieng – Magelang' },
  { value: 'solo_jogja', label: 'Solo – Prambanan – Merapi' },
  { value: 'karimunjawa', label: 'Jepara & Pulau Karimunjawa' },
];

const DURATION_SELECT_OPTIONS = [
  { value: '3d', label: '3 Hari 2 Malam' },
  { value: '4d', label: '4 Hari 3 Malam' },
  { value: '2d', label: '2 Hari Akhir Pekan' },
];

const BUDGET_SELECT_OPTIONS = [
  { value: '6m', label: 'Rp 6.000.000 – Rp 8.000.000' },
  { value: '10m', label: 'Rp 8.000.000 – Rp 12.000.000' },
  { value: '15m', label: 'Rp 12.000.000+ (Comfort)' },
];

export default function LandingPage() {
  const router = useRouter();
  const [selectedVibe, setSelectedVibe] = useState('alam');
  const [selectedCluster, setSelectedCluster] = useState('dieng_magelang');
  const [selectedDuration, setSelectedDuration] = useState('3d');
  const [selectedBudget, setSelectedBudget] = useState('10m');
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      num: '01',
      place: 'Dataran Tinggi Dieng, Wonosobo',
      image:
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1800&q=85',
    },
    {
      num: '02',
      place: 'Candi Borobudur & Punthuk Setumbu, Magelang',
      image:
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1800&q=85',
    },
    {
      num: '03',
      place: 'Taman Nasional Karimunjawa, Jepara',
      image:
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=85',
    },
    {
      num: '04',
      place: 'Kota Lama & Lereng Ungaran, Semarang',
      image:
        'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=1800&q=85',
    },
  ];

  const currentHero = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-[#F7F4EF] pb-20 md:pb-0">
      <TopNavbar />

      <PageTransition>
        {/* ===================================================================
            HERO SECTION (Earth Tone + Polished Custom Select Dropdowns)
        =================================================================== */}
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-[#231E1B] text-white shadow-xl min-h-140 flex flex-col justify-between overflow-visible">
            {/* Background Landscape Image */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div
                className="h-full w-full bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${currentHero.image})` }}
              />
              <div className="absolute inset-0 bg-linear-to-b from-[#231E1B]/65 via-[#231E1B]/45 to-[#231E1B]/90" />
            </div>

            {/* Top Hero Metadata Bar */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-xs font-medium text-[#FAF8F5]">
                <Sparkles className="h-3.5 w-3.5 text-[#D4A373]" />
                <span>Tabel Itinerary Interaktif & Split-Bill Jawa Tengah</span>
              </div>
              <span className="hidden sm:inline-block text-xs text-[#E5DFD3]">
                📍 {currentHero.place}
              </span>
            </div>

            {/* Center Editorial Headline */}
            <div className="relative z-10 my-auto px-6 py-10 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A373] mb-2.5">
                  JAWA TENGAH TRIP PLANNER
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#FAF8F5]">
                  Rencanakan Trip{' '}
                  <span className="font-serif-editorial italic font-normal text-[#E8D5B7]">
                    Lebih Rapi
                  </span>{' '}
                  dalam Satu Tabel.
                </h1>
                <p className="mt-4 max-w-xl text-sm sm:text-base text-[#E5DFD3] leading-relaxed mx-auto lg:mx-0">
                  Ketik langsung tujuan Anda, atur jam keberangkatan, hitung estimasi biaya, dan
                  bagikan akses edit/lihat ke maksimal 4 rekan perjalanan seperti di Canva.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FAF8F5] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#231E1B] shadow-md transition-all hover:bg-[#EFECE4]"
                  >
                    <Table2 className="h-4 w-4 text-[#4F5D48]" />
                    <span>Buka Tabel Itinerary Sekarang</span>
                  </Link>
                  <Link
                    href="/trips/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/25"
                  >
                    <span>Mulai dari Kuesioner</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right Slide Numbering */}
              <div className="flex lg:flex-col items-center gap-2.5 bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 lg:py-4">
                {heroSlides.map((slide, idx) => {
                  const active = idx === activeSlide;
                  return (
                    <button
                      key={slide.num}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`text-xs font-bold tabular-nums transition-all px-2.5 py-1 rounded-lg cursor-pointer ${
                        active
                          ? 'text-[#231E1B] bg-[#E8D5B7]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {slide.num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Filter Bar using CustomSelect (No ugly native select!) */}
            <div className="relative z-20 rounded-b-3xl bg-[#231E1B]/85 backdrop-blur-xl border-t border-white/15 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                <CustomSelect
                  variant="glass"
                  label="Gaya Perjalanan"
                  value={selectedVibe}
                  onChange={setSelectedVibe}
                  options={VIBE_SELECT_OPTIONS}
                />
                <CustomSelect
                  variant="glass"
                  label="Koridor Jawa Tengah"
                  value={selectedCluster}
                  onChange={setSelectedCluster}
                  options={CLUSTER_SELECT_OPTIONS}
                />
                <CustomSelect
                  variant="glass"
                  label="Durasi Trip"
                  value={selectedDuration}
                  onChange={setSelectedDuration}
                  options={DURATION_SELECT_OPTIONS}
                />
                <CustomSelect
                  variant="glass"
                  label="Estimasi Anggaran"
                  value={selectedBudget}
                  onChange={setSelectedBudget}
                  options={BUDGET_SELECT_OPTIONS}
                />
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full rounded-xl bg-[#4F5D48] py-3 px-5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#3E4A38] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Buka Tabel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 2: EARTH-TONE VALUE PROPOSITION
        =================================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFECE4] border border-[#DFD8CC] px-3 py-1 text-xs font-semibold text-[#4F5D48]">
              <Table2 className="h-3.5 w-3.5" /> Tampilan Tabel Ramah Pengguna
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFECE4] border border-[#DFD8CC] px-3 py-1 text-xs font-semibold text-[#8C6D53]">
              <Users className="h-3.5 w-3.5" /> Kolaborasi Gaya Canva (Maks 4 Orang)
            </span>
          </div>

          <h2 className="text-center text-2xl sm:text-4xl font-bold tracking-tight text-[#2A2421] max-w-2xl mx-auto leading-snug">
            Dirancang Sederhana untuk{' '}
            <span className="font-serif-editorial italic font-normal text-[#4F5D48]">
              Perencanaan Nyata
            </span>
          </h2>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-block rounded-lg border border-[#DFD8CC] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6E655E]">
                • Alur Kerja Sederhana
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2A2421] leading-snug">
                Input Sendiri Tujuan & Jam Anda, Bagikan seperti di Canva
              </h3>
              <p className="text-sm text-[#5C534C] leading-relaxed">
                Tidak perlu berpindah-pindah halaman yang rumit. Di halaman Dashboard, Anda langsung
                mendapatkan tabel interaktif untuk mengetik tujuan, jam, biaya, serta tombol{' '}
                <strong>Bagikan</strong> untuk mengatur izin teman (Bisa Edit atau Hanya Lihat).
              </p>
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 text-xs font-medium text-[#4A423D]">
                  <CheckCircle2 className="h-4 w-4 text-[#4F5D48] shrink-0 mt-0.5" />
                  <span>
                    <strong>Tabel Jadwal Langsung:</strong> Tambah, edit, duplikat, kunci, atau
                    hapus baris kegiatan langsung di dalam tabel.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-[#4A423D]">
                  <CheckCircle2 className="h-4 w-4 text-[#4F5D48] shrink-0 mt-0.5" />
                  <span>
                    <strong>Sistem Izin Canva:</strong> Fokus pada 1 akun Anda, dengan tombol
                    &quot;Bagikan&quot; untuk mengatur akses 3 rekan lainnya via email.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-[#4A423D]">
                  <CheckCircle2 className="h-4 w-4 text-[#4F5D48] shrink-0 mt-0.5" />
                  <span>
                    <strong>Tabel Keuangan & Split-Bill:</strong> Otomatis membagi pengeluaran dan
                    menghitung siapa harus transfer ke siapa.
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2A2421] px-5 py-3 text-xs font-bold text-white hover:bg-[#3D3530] transition-all"
                >
                  <span>Coba Tabel Itinerary</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {JAWA_TENGAH_CLUSTERS_INFO.slice(0, 3).map((cluster) => (
                <div
                  key={cluster.id}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-[#E5DFD3] shadow-2xs transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={cluster.hero_image}
                      alt={cluster.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#231E1B]/85 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-lg bg-[#231E1B]/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FAF8F5]">
                      {cluster.elevation_or_stat}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-sm font-bold">{cluster.name}</p>
                      <p className="text-[11px] text-[#E5DFD3] line-clamp-1 mt-0.5">
                        {cluster.highlights.join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 3: CURATED JAWA TENGAH HIGHLIGHTS (Warm Espresso Contrast)
        =================================================================== */}
        <section className="bg-[#231E1B] py-16 text-[#FAF8F5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4A373]">
                  Inspirasi Tujuan Jawa Tengah
                </p>
                <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight">
                  Destinasi Populer untuk{' '}
                  <span className="font-serif-editorial italic font-normal text-[#E8D5B7]">
                    Dimasukkan ke Tabel Anda
                  </span>
                </h2>
              </div>
              <Link
                href="/dashboard"
                className="text-xs font-bold text-[#E8D5B7] hover:underline inline-flex items-center gap-1"
              >
                Lihat Semua di Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CURATED_JAWA_TENGAH_SPOTS.filter((s) => s.highlight_rank).map((spot) => (
                <div
                  key={spot.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#2E2723] aspect-3/4 flex flex-col justify-end p-5"
                >
                  <img
                    src={spot.image_url}
                    alt={spot.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#1A1614] via-[#1A1614]/40 to-transparent" />
                  <div className="relative z-10">
                    <span className="inline-block rounded-md bg-[#D4A373]/25 border border-[#D4A373]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#E8D5B7] mb-2">
                      {spot.cluster} • {spot.highlight_rank}
                    </span>
                    <h3 className="text-base font-bold leading-snug text-white">{spot.title}</h3>
                    <p className="text-xs text-[#D2C9B8] mt-1">{spot.location_name}</p>
                    <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-[#E5DFD3] tabular-nums">
                      <span>Est. Rp {spot.estimated_cost.toLocaleString('id-ID')}</span>
                      <span>
                        {spot.recommended_start}–{spot.recommended_end}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 4: EARTH-TONE BENTO SUMMARY
        =================================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <BentoCard variant="obsidian" padding="lg" className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#D4A373]">
                  <Lock className="h-5 w-5" />
                </div>
                <span className="rounded-lg bg-[#4F5D48]/40 border border-[#A3B899]/30 px-2.5 py-1 text-[11px] font-semibold text-[#D6E3CE]">
                  Canva-Style Permissions
                </span>
              </div>

              <div className="my-6">
                <h3 className="text-lg font-bold text-white">
                  Edit, Duplikat, Kunci & Hapus Baris dengan Izin Terbatas
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#D2C9B8] leading-relaxed">
                  Undang hingga 3 teman lewat tombol <strong>Bagikan</strong>. Anda bisa mengunci
                  baris tabel tertentu agar tidak diubah oleh Editor, atau mengatur teman sebagai
                  Hanya Lihat (Viewer).
                </p>
              </div>

              <Link
                href="/dashboard"
                className="w-full rounded-xl bg-[#4F5D48] hover:bg-[#5E6E56] py-2.5 text-center text-xs font-bold text-white transition-all"
              >
                Buka Tabel Perencanaan
              </Link>
            </BentoCard>

            <BentoCard variant="subtle" padding="lg" className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F5D48] text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5C534C]">
                  Integer BIGINT Rupiah
                </span>
              </div>

              <div className="my-6">
                <h3 className="text-lg font-bold text-[#2A2421]">
                  Tabel Keuangan & Split-Bill Otomatis
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#5C534C] leading-relaxed">
                  Setiap baris jadwal dapat dikirim ke tabel pengeluaran aktual dengan 1 klik.
                  Sistem langsung menghitung pembagian biaya dan siapa yang harus mentransfer ke
                  siapa.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="w-full rounded-xl bg-[#2A2421] hover:bg-[#3D3530] py-2.5 text-center text-xs font-bold text-white transition-all"
              >
                Lihat Tabel Split-Bill
              </Link>
            </BentoCard>

            <BentoCard variant="white" padding="lg" className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6E655E]">
                  Proporsi Rencana Jawa Tengah
                </p>
                <p className="mt-1 text-xl font-bold text-[#2A2421]">
                  Keseimbangan Jadwal & Budget
                </p>
              </div>

              <div className="my-5 space-y-2 border-t border-b border-[#EDE8DD] py-4">
                <DotMatrixProgress label="Eksplor Alam" value={90} rightText="90%" tone="emerald" />
                <DotMatrixProgress label="Kuliner Lokal" value={85} rightText="85%" tone="amber" />
                <DotMatrixProgress label="Candi & Budaya" value={80} rightText="80%" tone="rose" />
                <DotMatrixProgress label="Keamanan Dana" value={100} rightText="100%" tone="obsidian" />
              </div>

              <div className="flex items-center justify-between text-xs text-[#6E655E]">
                <span>Tersedia di HP, Tablet & Laptop</span>
                <Link href="/trips/new" className="font-bold text-[#4F5D48] hover:underline">
                  Isi Kuesioner →
                </Link>
              </div>
            </BentoCard>
          </div>
        </section>
      </PageTransition>
    </div>
  );
}
