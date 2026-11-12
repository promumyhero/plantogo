'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Compass, Table2, PlusCircle, User } from 'lucide-react';

export function TopNavbar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F4EF]/95 backdrop-blur-md border-b border-[#E5DFD3] text-[#2A2421]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo (Earth Tone) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F5D48] text-[#FAF8F5] transition-transform group-hover:scale-105">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight leading-none text-[#2A2421]">
              PlanToGo
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-[#7D736B] mt-0.5">
              Jawa Tengah Planner
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/'
                ? 'bg-[#2A2421] text-[#FAF8F5]'
                : 'text-[#5C534C] hover:text-[#2A2421] hover:bg-[#EBE5D9]'
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              pathname === '/dashboard' || (pathname?.startsWith('/trips/') && pathname !== '/trips/new')
                ? 'bg-[#2A2421] text-[#FAF8F5]'
                : 'text-[#5C534C] hover:text-[#2A2421] hover:bg-[#EBE5D9]'
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            Dashboard Tabel Itinerary
          </Link>
          <Link
            href="/trips/new"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              pathname === '/trips/new'
                ? 'bg-[#4F5D48] text-white'
                : 'bg-[#EBE5D9] text-[#2A2421] hover:bg-[#DFD8C8]'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Kuesioner Trip Baru
          </Link>
        </nav>

        {/* Single-User Profile Pill (Earth Tone) */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="flex items-center gap-2.5 rounded-xl border border-[#DFD8CC] bg-white px-3 py-1.5 text-xs font-medium text-[#2A2421] hover:border-[#B8AFA3] transition-all"
            title="Profil Pengguna Aktif"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: '#4F5D48' }}
            >
              {currentUser.full_name.charAt(0).toUpperCase()}
            </span>
            <div className="hidden sm:flex flex-col leading-tight text-left">
              <span className="font-semibold text-[#2A2421] truncate max-w-[130px]">
                {currentUser.full_name}
              </span>
              <span className="text-[10px] text-[#7D736B] truncate max-w-[130px]">
                {currentUser.email}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-[#E5DFD3] bg-[#F7F4EF]/95 backdrop-blur-lg py-2 px-3 text-[#5C534C]">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold ${
            pathname === '/' ? 'text-[#2A2421] font-bold' : 'text-[#8C8279]'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Beranda</span>
        </Link>
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold ${
            pathname === '/dashboard' || (pathname?.startsWith('/trips/') && pathname !== '/trips/new')
              ? 'text-[#2A2421] font-bold'
              : 'text-[#8C8279]'
          }`}
        >
          <Table2 className="h-4 w-4" />
          <span>Tabel Trip</span>
        </Link>
        <Link
          href="/trips/new"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold ${
            pathname === '/trips/new' ? 'text-[#4F5D48] font-bold' : 'text-[#8C8279]'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Kuesioner</span>
        </Link>
        <Link
          href="/login"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-semibold ${
            pathname === '/login' ? 'text-[#2A2421] font-bold' : 'text-[#8C8279]'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profil</span>
        </Link>
      </div>
    </header>
  );
}
