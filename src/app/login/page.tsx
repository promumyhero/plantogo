'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/layout/navbar';
import { EditorialFooter } from '@/components/layout/footer';
import { PageTransition } from '@/components/layout/page-transition';
import { BentoCard } from '@/components/ui/bento-card';
import { StrictTextInput } from '@/components/ui/strict-text-input';
import { useAuth } from '@/lib/auth/context';
import { normalizeEmail } from '@/lib/auth/demo-users';
import { useTripStore } from '@/lib/store/trip-store';
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Table2,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const {
    currentUser,
    availableAccounts,
    isAuthenticated,
    loginWithCustomEmail,
    switchEmailSession,
    logout,
  } = useAuth();
  const { autoActivatePendingEmail } = useTripStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(currentUser.email);
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [bankInfo, setBankInfo] = useState(currentUser.bank_info || '');
  const [accessPin, setAccessPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginWithCustomEmail(email, fullName, bankInfo);
    if (ok) {
      autoActivatePendingEmail(email, `user-${Date.now()}`);
      router.push('/dashboard');
    }
  };

  const handleQuickDemoSelect = (targetEmail: string, targetName: string, targetBank?: string) => {
    setEmail(targetEmail);
    setFullName(targetName);
    setBankInfo(targetBank || '');
    switchEmailSession(targetEmail);
    autoActivatePendingEmail(targetEmail, `user-${Date.now()}`);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col justify-between">
      <div>
        <TopNavbar />

        <PageTransition className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          {/* Active Session Banner (When Logged In) */}
          {isAuthenticated && (
            <div className="rounded-2xl border border-[#C5D3BE] bg-[#EEF2EC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: currentUser.badgeColor || '#4F5D48' }}
                >
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3F4D39]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sesi Login Aktif
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#2A2421] truncate">
                    {currentUser.full_name} ({currentUser.email})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F5D48] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#3F4B39] transition-all"
                >
                  <Table2 className="h-3.5 w-3.5" />
                  <span>Ke Tabel Itinerary</span>
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD8CC] bg-white px-3.5 py-2 text-xs font-bold text-[#2A2421] hover:bg-[#FAF8F5] transition-all"
                >
                  <span>Profil & Riwayat Trip</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5C5B8] bg-[#FBF3F0] px-3.5 py-2 text-xs font-bold text-[#B84A32] hover:bg-[#F5E3DC] transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: LOGIN / REGISTER FORM (7 Cols) */}
            <div className="lg:col-span-7">
              <BentoCard variant="white" padding="lg" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE8DD] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F5D48] text-white shrink-0">
                      {authMode === 'login' ? (
                        <LogIn className="h-5 w-5" />
                      ) : (
                        <UserPlus className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold text-[#2A2421]">
                        {authMode === 'login'
                          ? 'Masuk ke Akun PlanToGo'
                          : 'Daftar Identitas Kolaborator Baru'}
                      </h1>
                      <p className="text-xs text-[#6E655E]">
                        Gunakan email Anda untuk sinkronisasi otomatis dengan undangan tabel Canva
                      </p>
                    </div>
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex items-center gap-1 bg-[#F5F1E8] p-1 rounded-xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        authMode === 'login'
                          ? 'bg-[#2A2421] text-white'
                          : 'text-[#6E655E] hover:text-[#2A2421]'
                      }`}
                    >
                      Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setEmail('');
                        setFullName('');
                        setBankInfo('');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        authMode === 'register'
                          ? 'bg-[#2A2421] text-white'
                          : 'text-[#6E655E] hover:text-[#2A2421]'
                      }`}
                    >
                      Akun Baru
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <StrictTextInput
                    id="login-email"
                    mode="email"
                    label="Alamat Email Kolaborator"
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={setEmail}
                    maxLength={80}
                    required
                    helperText="Otomatis huruf kecil & terhubung dengan izin tabel (Owner / Editor / Viewer)."
                  />

                  <StrictTextInput
                    id="login-name"
                    mode="person_name"
                    label="Nama Lengkap (Khusus Huruf)"
                    placeholder="Contoh: Ridho Hery"
                    value={fullName}
                    onChange={setFullName}
                    maxLength={50}
                    required
                    helperText="Ditampilkan pada avatar kolaborator dan tabel Split-Bill."
                  />

                  <StrictTextInput
                    id="login-bank"
                    mode="title_text"
                    label="Info Rekening / E-Wallet (Untuk Split-Bill)"
                    placeholder="Contoh: BCA 8820194812 a/n Ridho Hery"
                    value={bankInfo}
                    onChange={setBankInfo}
                    maxLength={80}
                    helperText="Memudahkan rekan perjalanan mentransfer pelunasan patungan."
                  />

                  <div>
                    <label
                      htmlFor="login-pin"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-1.5"
                    >
                      Kata Sandi / PIN Sesi (Opsional di Mode Lokal)
                    </label>
                    <div className="relative">
                      <KeyRound className="h-4 w-4 text-[#8C8279] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-pin"
                        type="password"
                        value={accessPin}
                        onChange={(e) => setAccessPin(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#DFD8CC] bg-white pl-10 pr-4 py-2.5 text-sm text-[#2A2421] placeholder:text-[#B8AFA3] focus:border-[#4F5D48] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#4F5D48] py-3 px-6 text-sm font-bold text-white shadow-xs hover:bg-[#3F4B39] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>
                      {authMode === 'login'
                        ? 'Masuk & Buka Dashboard Tabel'
                        : 'Daftarkan Akun & Masuk'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </BentoCard>
            </div>

            {/* RIGHT: 1-CLICK DEMO COLLABORATOR ACCOUNTS (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <BentoCard variant="subtle" padding="lg" className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A2421] text-white shrink-0">
                    <ShieldCheck className="h-4 w-4 text-[#D4A373]" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#2A2421]">
                      Login Cepat 1-Klik (Simulasi 4 Kolaborator)
                    </h2>
                    <p className="text-[11px] text-[#6E655E]">
                      Uji sistem izin ala Canva tanpa perlu ketik manual
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {availableAccounts.map((acc) => {
                    const isCurrent =
                      isAuthenticated &&
                      normalizeEmail(acc.email) === normalizeEmail(currentUser.email);

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() =>
                          handleQuickDemoSelect(acc.email, acc.full_name, acc.bank_info)
                        }
                        className={`w-full rounded-xl border p-3 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isCurrent
                            ? 'border-[#4F5D48] bg-white shadow-xs'
                            : 'border-[#DFD8CC] bg-[#FAF8F5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: acc.badgeColor || '#4F5D48' }}
                          >
                            {acc.full_name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-[#2A2421] truncate">
                              {acc.full_name}
                            </p>
                            <p className="text-[11px] text-[#6E655E] truncate flex items-center gap-1">
                              <Mail className="h-3 w-3 shrink-0" /> {acc.email}
                            </p>
                            <p className="text-[10px] font-semibold text-[#4F5D48] mt-0.5 truncate">
                              {acc.shortBio}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold shrink-0 ${
                            isCurrent
                              ? 'bg-[#4F5D48] text-white'
                              : 'bg-[#EFECE4] text-[#2A2421]'
                          }`}
                        >
                          {isCurrent ? 'Aktif' : 'Masuk →'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </BentoCard>
            </div>
          </div>
        </PageTransition>
      </div>

      <EditorialFooter />
    </div>
  );
}
