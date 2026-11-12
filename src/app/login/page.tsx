'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/layout/navbar';
import { PageTransition } from '@/components/layout/page-transition';
import { BentoCard } from '@/components/ui/bento-card';
import { StrictTextInput } from '@/components/ui/strict-text-input';
import { useAuth } from '@/lib/auth/context';
import { useTripStore } from '@/lib/store/trip-store';
import { ArrowRight, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginWithCustomEmail } = useAuth();
  const { autoActivatePendingEmail } = useTripStore();

  const [email, setEmail] = useState(currentUser.email);
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [bankInfo, setBankInfo] = useState(currentUser.bank_info || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginWithCustomEmail(email, fullName, bankInfo);
    if (ok) {
      autoActivatePendingEmail(email, `user-${Date.now()}`);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] pb-24 md:pb-12">
      <TopNavbar />

      <PageTransition className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <BentoCard variant="white" padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#EDE8DD] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F5D48] text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#2A2421]">
                Profil & Email Pengguna Utama
              </h1>
              <p className="text-xs text-[#6E655E]">
                Email ini digunakan sebagai identitas utama Anda saat membuat atau membagikan
                tabel perjalanan
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <StrictTextInput
              id="login-email"
              mode="email"
              label="Alamat Email Anda"
              placeholder="nama@email.com"
              value={email}
              onChange={setEmail}
              maxLength={80}
              required
              helperText="Otomatis huruf kecil & tanpa spasi."
            />

            <StrictTextInput
              id="login-name"
              mode="person_name"
              label="Nama Lengkap (Khusus Huruf)"
              placeholder="Ridho Hery"
              value={fullName}
              onChange={setFullName}
              maxLength={50}
              required
              helperText="Hanya menerima huruf dan spasi."
            />

            <StrictTextInput
              id="login-bank"
              mode="title_text"
              label="Info Rekening / E-Wallet (Untuk Split-Bill)"
              placeholder="Contoh: BCA 8820194812 a/n Ridho"
              value={bankInfo}
              onChange={setBankInfo}
              maxLength={80}
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-[#4F5D48] py-3 px-6 text-sm font-bold text-white shadow-xs hover:bg-[#3F4B39] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Simpan & Kembali ke Tabel Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </BentoCard>
      </PageTransition>
    </div>
  );
}
