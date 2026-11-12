'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Table2, PlusCircle, User, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

export function EditorialFooter() {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-[#E5DFD3] bg-[#EFECE4]/70 text-[#5C534C] pb-24 md:pb-10 pt-10 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-[#DFD8CC]">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-5 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4F5D48] text-[#FAF8F5]">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-[#2A2421]">
                PlanToGo
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#6E655E] max-w-md leading-relaxed">
              Aplikasi perencanaan jadwal perjalanan interaktif berbasis tabel & kalkulator{' '}
              <em>Split-Bill</em> otomatis dengan sistem izin kolaborasi ala Canva (Owner, Editor,
              Viewer).
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#DFD8CC] px-3 py-1.5 text-[11px] font-semibold text-[#4F5D48]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Responsif untuk HP, Tablet & Laptop • Akurasi Rupiah Integer</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-4 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2A2421]">
              Navigasi Utama
            </p>
            <ul className="grid grid-cols-2 gap-2 text-xs font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#2A2421] transition-colors inline-flex items-center gap-1.5 py-1"
                >
                  <Compass className="h-3.5 w-3.5 text-[#4F5D48]" />
                  <span>Beranda</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[#2A2421] transition-colors inline-flex items-center gap-1.5 py-1"
                >
                  <Table2 className="h-3.5 w-3.5 text-[#4F5D48]" />
                  <span>Tabel Itinerary</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/trips/new"
                  className="hover:text-[#2A2421] transition-colors inline-flex items-center gap-1.5 py-1"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-[#C46A4E]" />
                  <span>Buat Trip Baru</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-[#2A2421] transition-colors inline-flex items-center gap-1.5 py-1"
                >
                  <User className="h-3.5 w-3.5 text-[#8C6D53]" />
                  <span>Profil & Riwayat</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-[#2A2421] transition-colors inline-flex items-center gap-1.5 py-1"
                >
                  <LogIn className="h-3.5 w-3.5 text-[#2A2421]" />
                  <span>{isAuthenticated ? 'Ganti Akun / Sesi' : 'Login Akun'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Active Session Summary */}
          <div className="lg:col-span-3 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2A2421]">
              Status Sesi Aktif
            </p>
            <div className="rounded-xl border border-[#DFD8CC] bg-white p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: isAuthenticated ? '#4F5D48' : '#C46A4E' }}
                />
                <span className="text-xs font-bold text-[#2A2421] truncate">
                  {isAuthenticated ? currentUser.full_name : 'Mode Tamu (Belum Login)'}
                </span>
              </div>
              <p className="text-[11px] text-[#7D736B] truncate">
                {isAuthenticated ? currentUser.email : 'Masuk untuk menyimpan riwayat kolaborasi'}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Link
                  href="/profile"
                  className="text-[11px] font-bold text-[#4F5D48] hover:underline"
                >
                  Kelola Profil →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7D736B]">
          <p>© {new Date().getFullYear()} PlanToGo — Collaborative Trip & Split-Bill Workspace.</p>
          <p className="text-[11px]">
            Palet Earth-Tone • Dirancang Nyaman untuk Layar HP, Tablet, dan Laptop
          </p>
        </div>
      </div>
    </footer>
  );
}

