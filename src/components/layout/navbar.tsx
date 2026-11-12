'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  Compass,
  History,
  LogIn,
  LogOut,
  PlusCircle,
  Table2,
  User,
} from 'lucide-react';

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAuth();

  const handleLogoutClick = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F4EF]/95 backdrop-blur-md border-b border-[#E5DFD3] text-[#2A2421]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3.5 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* Brand Logo (Earth Tone) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#4F5D48] text-[#FAF8F5] transition-transform group-hover:scale-105">
            <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight leading-none text-[#2A2421]">
              PlanToGo
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase text-[#7D736B] mt-0.5">
              Trip & Split-Bill
            </span>
          </div>
        </Link>

        {/* Center Navigation (Tablet & Laptop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 overflow-x-auto">
          <Link
            href="/"
            className={`px-3 lg:px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              pathname === '/'
                ? 'bg-[#2A2421] text-[#FAF8F5]'
                : 'text-[#5C534C] hover:text-[#2A2421] hover:bg-[#EBE5D9]'
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 lg:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              pathname === '/dashboard' ||
              (pathname?.startsWith('/trips/') && pathname !== '/trips/new')
                ? 'bg-[#2A2421] text-[#FAF8F5]'
                : 'text-[#5C534C] hover:text-[#2A2421] hover:bg-[#EBE5D9]'
            }`}
          >
            <Table2 className="h-3.5 w-3.5 shrink-0" />
            <span>Tabel Itinerary</span>
          </Link>
          <Link
            href="/trips/new"
            className={`px-3 lg:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              pathname === '/trips/new'
                ? 'bg-[#4F5D48] text-white'
                : 'bg-[#EBE5D9] text-[#2A2421] hover:bg-[#DFD8C8]'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Buat Trip</span>
          </Link>
          <Link
            href="/profile"
            className={`px-3 lg:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              pathname === '/profile'
                ? 'bg-[#2A2421] text-[#FAF8F5]'
                : 'text-[#5C534C] hover:text-[#2A2421] hover:bg-[#EBE5D9]'
            }`}
          >
            <History className="h-3.5 w-3.5 shrink-0" />
            <span>Riwayat & Profil</span>
          </Link>
        </nav>

        {/* Right: User Profile Pill + Login/Logout Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl border border-[#DFD8CC] bg-white px-2.5 py-1.5 text-xs font-medium text-[#2A2421] hover:border-[#B8AFA3] transition-all"
                title="Buka Profil & Riwayat Pembuatan Trip"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: currentUser.badgeColor || '#4F5D48' }}
                >
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </span>
                <div className="hidden sm:flex flex-col leading-tight text-left max-w-28 lg:max-w-36">
                  <span className="font-semibold text-[#2A2421] truncate text-xs">
                    {currentUser.full_name}
                  </span>
                  <span className="text-[10px] text-[#7D736B] truncate">
                    {currentUser.email}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#E5C5B8] bg-[#FBF3F0] p-2 sm:px-2.5 sm:py-2 text-xs font-bold text-[#B84A32] hover:bg-[#F5E3DC] transition-all cursor-pointer"
                title="Logout / Keluar Sesi"
                aria-label="Logout"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden xl:inline text-[11px]">Keluar</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F5D48] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#3F4B39] transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 md:hidden items-center border-t border-[#E5DFD3] bg-[#F7F4EF]/95 backdrop-blur-lg px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] text-[#5C534C] shadow-lg"
      >
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold truncate ${
            pathname === '/' ? 'text-[#2A2421] font-bold bg-[#EBE5D9]/60' : 'text-[#7D736B]'
          }`}
        >
          <Compass className="h-4 w-4 shrink-0" />
          <span className="truncate">Beranda</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold truncate ${
            pathname === '/dashboard' ||
            (pathname?.startsWith('/trips/') && pathname !== '/trips/new')
              ? 'text-[#2A2421] font-bold bg-[#EBE5D9]/60'
              : 'text-[#7D736B]'
          }`}
        >
          <Table2 className="h-4 w-4 shrink-0" />
          <span className="truncate">Tabel Trip</span>
        </Link>

        <Link
          href="/trips/new"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold truncate ${
            pathname === '/trips/new'
              ? 'text-[#4F5D48] font-bold bg-[#EEF2EC]'
              : 'text-[#7D736B]'
          }`}
        >
          <PlusCircle className="h-4 w-4 shrink-0 text-[#4F5D48]" />
          <span className="truncate">Buat Trip</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold truncate ${
            pathname === '/profile'
              ? 'text-[#2A2421] font-bold bg-[#EBE5D9]/60'
              : 'text-[#7D736B]'
          }`}
        >
          <History className="h-4 w-4 shrink-0" />
          <span className="truncate">Riwayat</span>
        </Link>

        <Link
          href="/login"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold truncate ${
            pathname === '/login'
              ? 'text-[#2A2421] font-bold bg-[#EBE5D9]/60'
              : 'text-[#7D736B]'
          }`}
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate">{isAuthenticated ? 'Akun' : 'Login'}</span>
        </Link>
      </nav>
    </header>
  );
}
