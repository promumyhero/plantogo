'use client';

import React from 'react';
import { Expense, ExpenseCategory, ItineraryItem, Trip, TripMember } from '@/types/database';
import { BentoCard } from '@/components/ui/bento-card';
import { PieChart, TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; color: string }
> = {
  lodging: { label: 'Penginapan & Villa', color: '#4F5D48' },    // Sage Olive
  transport: { label: 'Transport & Tiket PP', color: '#C46A4E' }, // Terracotta Clay
  food: { label: 'Kuliner & Konsumsi', color: '#B58B61' },       // Sand Ochre
  tickets: { label: 'Tiket Wisata', color: '#8C6D53' },          // Warm Umber
  shopping: { label: 'Oleh-Oleh & Belanja', color: '#6B7B6E' },  // Eucalyptus
  other: { label: 'Dana Darurat / Lainnya', color: '#2A2421' },  // Deep Espresso
};

interface FinancialChartsProps {
  trip: Trip;
  members: TripMember[];
  itinerary: ItineraryItem[];
  expenses: Expense[];
  totalDays: number;
}

export function FinancialCharts({
  trip,
  members,
  itinerary,
  expenses,
  totalDays,
}: FinancialChartsProps) {
  // 1. Donut / Pie Chart Data by Category
  const categoryTotals = React.useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      lodging: 0,
      transport: 0,
      food: 0,
      tickets: 0,
      shopping: 0,
      other: 0,
    };
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const pieSlices = React.useMemo(() => {
    const entries = (Object.keys(CATEGORY_META) as ExpenseCategory[]).map((cat) => {
      const amount = categoryTotals[cat] || 0;
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      return {
        category: cat,
        label: CATEGORY_META[cat].label,
        color: CATEGORY_META[cat].color,
        amount,
        percentage,
      };
    });
    return entries.sort((a, b) => b.amount - a.amount);
  }, [categoryTotals, totalSpent]);

  // Build SVG Donut stroke-dasharray segments
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  // 2. Daily Line Chart Data (Day 1 .. totalDays)
  const safeTotalDays =
    typeof totalDays === 'number' && Number.isFinite(totalDays) && totalDays > 0
      ? totalDays
      : 3;

  const dailySeries = React.useMemo(() => {
    const daysCount = Math.max(2, safeTotalDays);
    const startMs = new Date(trip.start_date || '2026-12-24').getTime();

    return Array.from({ length: daysCount }).map((_, idx) => {
      const dayNum = idx + 1;
      // Sum actual expenses matching day_number or incurred_at date offset
      const actualForDay = (expenses || [])
        .filter((e) => {
          if (e.day_number) return e.day_number === dayNum;
          const expMs = new Date(e.incurred_at || trip.start_date).getTime();
          const diffDay = Math.round((expMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
          return diffDay === dayNum || (dayNum === 1 && (diffDay < 1 || diffDay > daysCount));
        })
        .reduce((s, e) => s + (e.amount || 0), 0);

      const plannedScheduleForDay = (itinerary || [])
        .filter((i) => i.status !== 'wishlist' && i.day_number === dayNum)
        .reduce((s, i) => s + (i.estimated_cost || 0), 0);

      return {
        dayNum,
        label: `Hari ${dayNum}`,
        actual: actualForDay,
        planned: plannedScheduleForDay,
      };
    });
  }, [expenses, itinerary, safeTotalDays, trip.start_date]);

  const maxDailyValue = Math.max(
    100000,
    ...dailySeries.map((d) => Math.max(d.actual, d.planned)),
    Math.round((trip.total_budget_plan || 8000000) / Math.max(1, safeTotalDays))
  );

  const safeMaxDaily =
    Number.isFinite(maxDailyValue) && maxDailyValue > 0 ? maxDailyValue : 100000;

  // SVG Line Chart coordinates (width 460, height 170)
  const chartW = 460;
  const chartH = 160;
  const padX = 36;
  const padY = 20;
  const usableW = chartW - padX * 2;
  const usableH = chartH - padY * 2;

  const getPoint = (index: number, val: number) => {
    const safeVal = Number.isFinite(val) ? val : 0;
    const x =
      dailySeries.length <= 1
        ? padX + usableW / 2
        : padX + (index / Math.max(1, dailySeries.length - 1)) * usableW;
    const y = padY + usableH - (Math.min(safeVal, safeMaxDaily) / safeMaxDaily) * usableH;
    return {
      x: Number.isFinite(x) ? x : padX,
      y: Number.isFinite(y) ? y : padY,
    };
  };

  const actualPoints = dailySeries.map((d, i) => getPoint(i, d.actual));
  const plannedPoints = dailySeries.map((d, i) => getPoint(i, d.planned));

  const actualPolyline = actualPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const plannedPolyline = plannedPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const actualAreaPath =
    actualPoints.length > 0
      ? `M ${actualPoints[0].x},${padY + usableH} L ${actualPoints
          .map((p) => `${p.x},${p.y}`)
          .join(' L ')} L ${actualPoints[actualPoints.length - 1].x},${padY + usableH} Z`
      : '';

  // 3. Per-Person Budget Carried vs Actual Share
  const memberBudgetStats = React.useMemo(() => {
    const defaultPerPerson = Math.round(
      (trip.total_budget_plan || 8000000) / Math.max(1, (members || []).length)
    );
    return (members || []).map((m) => {
      const carried =
        typeof m.personal_budget === 'number' && m.personal_budget > 0
          ? m.personal_budget
          : defaultPerPerson;
      const shareSpent = (expenses || []).reduce((sum, exp) => {
        const splits = Array.isArray(exp.splits) ? exp.splits : [];
        const split = splits.find((s) => s.member_id === m.id);
        return sum + (split ? split.share_amount : 0);
      }, 0);
      const paidUpfront = (expenses || [])
        .filter((e) => e.paid_by_member_id === m.id)
        .reduce((s, e) => s + (e.amount || 0), 0);
      const remainingPersonal = carried - shareSpent;
      return {
        member: m,
        carried,
        shareSpent,
        paidUpfront,
        remainingPersonal,
        usagePct: carried > 0 ? Math.round((shareSpent / carried) * 100) : 0,
      };
    });
  }, [expenses, members, trip.total_budget_plan]);

  const inclusion = trip.onboarding_answers?.budgetInclusion;

  return (
    <div className="space-y-6">
      {/* Top Row: Donut Chart (Category Breakdown) + Line Chart (Daily Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: DIAGRAM LINGKARAN (DONUT CHART) */}
        <BentoCard variant="white" padding="md" className="lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#EDE8DD] pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#4F5D48]" />
              <div>
                <h3 className="text-sm font-bold text-[#2A2421]">
                  Diagram Lingkaran Proporsi Biaya
                </h3>
                <p className="text-[11px] text-[#6E655E]">
                  Distribusi realisasi pengeluaran per kategori
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-[#EFECE4] px-2.5 py-1 text-[11px] font-bold text-[#4A423D]">
              6 Kategori
            </span>
          </div>

          <div className="my-4 flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Donut Chart */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg width="156" height="156" viewBox="0 0 156 156" className="-rotate-90">
                <circle
                  cx="78"
                  cy="78"
                  r={radius}
                  fill="transparent"
                  stroke="#EFECE4"
                  strokeWidth="20"
                />
                {(() => {
                  let currentOffset = 0;
                  return (
                    totalSpent > 0 &&
                    pieSlices.map((slice) => {
                      if (slice.amount <= 0) return null;
                      const strokeDasharray = `${
                        (slice.percentage / 100) * circumference
                      } ${circumference}`;
                      const strokeDashoffset = -(currentOffset / 100) * circumference;
                      currentOffset += slice.percentage;

                      return (
                        <circle
                          key={slice.category}
                          cx="78"
                          cy="78"
                          r={radius}
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    })
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7D736B]">
                  Total Aktual
                </span>
                <span className="text-xs font-bold text-[#2A2421] tabular-nums mt-0.5">
                  Rp {(totalSpent / 1000).toLocaleString('id-ID')}rb
                </span>
              </div>
            </div>

            {/* Legend & Percentages */}
            <div className="flex-1 w-full space-y-2">
              {pieSlices.map((s) => (
                <div
                  key={s.category}
                  className="flex items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[#4A423D] truncate font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="text-[#7D736B] text-[11px]">
                      Rp {s.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-[#2A2421] w-9 text-right">
                      {Math.round(s.percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Inclusion Info Strip */}
          {inclusion && (
            <div className="pt-3 border-t border-[#EDE8DD] flex flex-wrap items-center gap-2 text-[11px] text-[#5C534C]">
              <span className="font-semibold text-[#2A2421]">Cakupan Budget:</span>
              <span className="rounded-md bg-[#EFECE4] px-2 py-0.5">
                {inclusion.includesReturnTicket ? '✓ Termasuk Tiket PP' : '✗ Belum Tiket PP'}
              </span>
              <span className="rounded-md bg-[#EFECE4] px-2 py-0.5">
                {inclusion.includesLodging ? '✓ Termasuk Hotel' : '✗ Belum Hotel'}
              </span>
              {inclusion.vehicleDetails && (
                <span className="rounded-md bg-[#EFECE4] px-2 py-0.5">
                  🚗 {inclusion.vehicleDetails}
                </span>
              )}
            </div>
          )}
        </BentoCard>

        {/* RIGHT: DIAGRAM GARIS (DAILY EXPENSE & SCHEDULE TREND LINE CHART) */}
        <BentoCard variant="white" padding="md" className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDE8DD] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#C46A4E]" />
              <div>
                <h3 className="text-sm font-bold text-[#2A2421]">
                  Diagram Garis Tren Pengeluaran per Hari (Plan vs. Aktual)
                </h3>
                <p className="text-[11px] text-[#6E655E]">
                  Membandingkan estimasi biaya jadwal harian dengan realisasi pengeluaran aktual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-[#4F5D48]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4F5D48]" /> Realisasi Aktual
              </span>
              <span className="flex items-center gap-1.5 text-[#B58B61]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B58B61]" /> Estimasi Jadwal
              </span>
            </div>
          </div>

          <div className="my-3 w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH + 22}`}
              className="w-full h-48 overflow-visible"
            >
              {/* Horizontal Grid Lines */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = padY + usableH * (1 - ratio);
                const labelVal = Math.round((maxDailyValue * ratio) / 1000);
                return (
                  <g key={idx}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartW - padX}
                      y2={y}
                      stroke="#EDE8DD"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padX - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-[#8C8279] text-[9px] tabular-nums"
                    >
                      {labelVal}rb
                    </text>
                  </g>
                );
              })}

              {/* Area fill under Actual Line */}
              {actualAreaPath && (
                <path d={actualAreaPath} fill="#4F5D48" fillOpacity="0.12" />
              )}

              {/* Planned Dashed Line */}
              {plannedPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#B58B61"
                  strokeWidth="2.2"
                  strokeDasharray="5 4"
                  points={plannedPolyline}
                />
              )}

              {/* Actual Solid Line */}
              {actualPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#4F5D48"
                  strokeWidth="3"
                  points={actualPolyline}
                />
              )}

              {/* Data Nodes & X-Axis Labels */}
              {dailySeries.map((d, i) => {
                const ptActual = actualPoints[i];
                const ptPlan = plannedPoints[i];
                return (
                  <g key={d.dayNum}>
                    {/* Planned dot */}
                    <circle
                      cx={ptPlan.x}
                      cy={ptPlan.y}
                      r="4"
                      fill="#FAF8F5"
                      stroke="#B58B61"
                      strokeWidth="2"
                    />
                    {/* Actual dot */}
                    <circle
                      cx={ptActual.x}
                      cy={ptActual.y}
                      r="4.5"
                      fill="#4F5D48"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    {/* Value above actual dot */}
                    <text
                      x={ptActual.x}
                      y={ptActual.y - 8}
                      textAnchor="middle"
                      className="fill-[#2A2421] text-[9px] font-bold tabular-nums"
                    >
                      Rp {(d.actual / 1000).toLocaleString('id-ID')}rb
                    </text>
                    {/* X-axis Day Label */}
                    <text
                      x={ptActual.x}
                      y={padY + usableH + 18}
                      textAnchor="middle"
                      className="fill-[#5C534C] text-[10px] font-semibold"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-2 border-t border-[#EDE8DD] flex items-center justify-between text-xs text-[#6E655E]">
            <span>
              Rata-rata Anggaran Harian:{' '}
              <strong className="text-[#2A2421] tabular-nums">
                Rp {Math.round(trip.total_budget_plan / Math.max(1, totalDays)).toLocaleString('id-ID')} / hari
              </strong>
            </span>
            <span className="tabular-nums">
              Total Durasi: <strong>{totalDays} Hari</strong>
            </span>
          </div>
        </BentoCard>
      </div>

      {/* Bottom Row: Laporan Budget Bawaan Tiap Orang vs Beban Pengeluaran */}
      <BentoCard variant="white" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE8DD] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#4F5D48]" />
            <div>
              <h3 className="text-sm font-bold text-[#2A2421]">
                Laporan Budget Bawaan per Orang vs Pemakaian Aktual ({members.length} Orang)
              </h3>
              <p className="text-[11px] text-[#6E655E]">
                Memantau sisa dana masing-masing peserta berdasarkan budget yang dibawa dari awal
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberBudgetStats.map((stat) => {
            const isOver = stat.remainingPersonal < 0;
            return (
              <div
                key={stat.member.id}
                className="rounded-xl border border-[#E5DFD3] bg-[#FAF8F5] p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: stat.member.avatar_color || '#4F5D48' }}
                    >
                      {stat.member.display_name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2A2421] truncate">
                        {stat.member.display_name}
                      </p>
                      <p className="text-[10px] text-[#7D736B] truncate">
                        {stat.member.invited_email}
                      </p>
                    </div>
                  </div>
                  {isOver ? (
                    <AlertCircle className="h-4 w-4 text-[#C46A4E] shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#4F5D48] shrink-0" />
                  )}
                </div>

                {/* Progress bar of personal budget */}
                <div className="w-full h-2 rounded-full bg-[#E5DFD3] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-[#C46A4E]' : 'bg-[#4F5D48]'
                    }`}
                    style={{ width: `${Math.min(100, stat.usagePct)}%` }}
                  />
                </div>

                <div className="space-y-1 text-[11px] tabular-nums">
                  <div className="flex justify-between text-[#6E655E]">
                    <span>Budget Dibawa:</span>
                    <span className="font-semibold text-[#2A2421]">
                      Rp {stat.carried.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6E655E]">
                    <span>Beban Patungan:</span>
                    <span className="font-semibold text-[#8C6D53]">
                      Rp {stat.shareSpent.toLocaleString('id-ID')} ({stat.usagePct}%)
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#E5DFD3] font-bold">
                    <span className="text-[#4A423D]">Sisa Dana:</span>
                    <span className={isOver ? 'text-[#C46A4E]' : 'text-[#4F5D48]'}>
                      Rp {stat.remainingPersonal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </BentoCard>
    </div>
  );
}

