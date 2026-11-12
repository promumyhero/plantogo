import React from 'react';

interface DotMatrixProgressProps {
  label: string;
  value: number; // 0 to 100
  totalDots?: number;
  rightText?: string;
  tone?: 'blue' | 'emerald' | 'amber' | 'rose' | 'obsidian';
}

export function DotMatrixProgress({
  label,
  value,
  totalDots = 12,
  rightText,
  tone = 'emerald',
}: DotMatrixProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const activeCount = Math.round((clamped / 100) * totalDots);

  // Earth-tone mapped colors
  const toneActiveClass = {
    blue: 'bg-[#6B7B6E]',      // Eucalyptus Slate
    emerald: 'bg-[#4F5D48]',   // Deep Sage Olive
    amber: 'bg-[#B58B61]',     // Warm Ochre Sand
    rose: 'bg-[#C46A4E]',      // Terracotta Clay
    obsidian: 'bg-[#2A2421]',  // Deep Espresso
  }[tone];

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs font-medium text-[#6E655E] min-w-24 truncate">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-1 justify-end">
        {Array.from({ length: totalDots }).map((_, idx) => {
          const isActive = idx < activeCount;
          return (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                isActive ? toneActiveClass : 'bg-[#E5DFD3]'
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs font-semibold tabular-nums text-[#2A2421] min-w-11 text-right">
        {rightText ?? `${Math.round(clamped)}%`}
      </span>
    </div>
  );
}
