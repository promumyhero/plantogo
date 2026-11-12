'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (newValue: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  variant?: 'default' | 'compact' | 'glass';
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Pilih opsi...',
  variant = 'default',
  disabled = false,
  className = '',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const triggerStyles = {
    default:
      'w-full rounded-xl border border-[#DFD8CC] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#2A2421] hover:border-[#B8AFA3] focus:border-[#4F5D48] focus:outline-none',
    compact:
      'w-full rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] px-2.5 py-1.5 text-xs font-semibold text-[#2A2421] hover:border-[#B8AFA3] focus:border-[#4F5D48] focus:outline-none',
    glass:
      'w-full rounded-xl border border-white/25 bg-white/10 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/15 focus:outline-none',
  }[variant];

  return (
    <div ref={containerRef} className={`relative ${open ? 'z-50' : 'z-10'} ${className}`}>
      {label && (
        <label
          className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 truncate ${
            variant === 'glass' ? 'text-[#E6DFD3]' : 'text-[#6E655E]'
          }`}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 text-left transition-all cursor-pointer ${triggerStyles} ${
          disabled ? 'opacity-55 cursor-not-allowed' : ''
        }`}
      >
        <span className="truncate leading-snug">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            variant === 'glass' ? 'text-white/75' : 'text-[#8C8279]'
          } ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 z-50 mt-1.5 w-full ${
            variant === 'compact' ? 'min-w-[150px]' : 'min-w-[210px]'
          } max-h-60 overflow-y-auto rounded-xl border border-[#DFD8CC] bg-white p-1.5 text-[#2A2421] shadow-xl`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#EFECE4] text-[#2A2421] font-bold'
                    : 'text-[#4A423D] hover:bg-[#FAF8F5] font-medium'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs leading-snug truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="rounded-md bg-[#E8E2D5] px-1.5 py-0.5 text-[10px] font-semibold text-[#5C534C]">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <p className="text-[11px] text-[#7D736B] truncate mt-0.5 font-normal">
                      {opt.description}
                    </p>
                  )}
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#4F5D48] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
