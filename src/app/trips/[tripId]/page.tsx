'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TopNavbar } from '@/components/layout/navbar';
import { EditorialFooter } from '@/components/layout/footer';
import { PageTransition } from '@/components/layout/page-transition';
import { CanvaItineraryWorkspace } from '@/components/itinerary/canva-itinerary-workspace';
import { History, Plus, Table2 } from 'lucide-react';

export default function TripWorkspacePage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params?.tripId || 'jateng-expedition-2026';

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col justify-between">
      <div>
        <TopNavbar />

        <PageTransition className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFECE4] border border-[#DFD8CC] px-3 py-1 text-xs font-semibold text-[#4F5D48]">
                <Table2 className="h-3.5 w-3.5" />
                <span>Tabel Perencanaan & Split-Bill</span>
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2421]">
                Tabel Jadwal & Keuangan Perjalanan
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#6E655E]">
                Input langsung baris tujuan Anda, duplikat atau kunci baris, dan bagikan akses ke
                maksimal 4 orang.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-end">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD8CC] bg-white px-3.5 py-2.5 text-xs font-bold text-[#2A2421] hover:bg-[#EFECE4] transition-all"
              >
                <History className="h-3.5 w-3.5 text-[#4F5D48]" />
                <span>Riwayat Trip</span>
              </Link>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2A2421] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3D3530] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Trip Baru</span>
              </Link>
            </div>
          </div>

          <CanvaItineraryWorkspace initialTripId={tripId} />
        </PageTransition>
      </div>

      <EditorialFooter />
    </div>
  );
}
