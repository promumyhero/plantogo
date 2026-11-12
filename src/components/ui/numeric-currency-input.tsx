'use client';

import React, { useState, useEffect } from 'react';

interface NumericCurrencyInputProps {
  value: number;
  onChange: (newValue: number) => void;
  label?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  compact?: boolean;
  helperText?: string;
  errorText?: string;
  className?: string;
  id?: string;
}

export function formatIntegerRupiah(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '';
  return Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function sanitizeDigitsOnly(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function NumericCurrencyInput({
  value,
  onChange,
  label,
  placeholder = '0',
  prefix = 'Rp',
  suffix,
  min = 0,
  max = 10_000_000_000,
  disabled = false,
  compact = false,
  helperText,
  errorText,
  className = '',
  id,
}: NumericCurrencyInputProps) {
  const safeInitial =
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
  const [displayValue, setDisplayValue] = useState<string>(() =>
    safeInitial > 0 ? formatIntegerRupiah(safeInitial) : ''
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    const currentNumeric = sanitizeDigitsOnly(displayValue);
    const safeValue =
      typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;

    if (!isFocused || currentNumeric !== safeValue) {
      if (safeValue > 0) {
        setDisplayValue(formatIntegerRupiah(safeValue));
      } else if (!isFocused) {
        setDisplayValue('');
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const inputEl = e.target;
    const prevCursorPos = inputEl.selectionStart || 0;
    const digitsBeforeCursor = raw.slice(0, prevCursorPos).replace(/\D/g, '').length;

    if (!raw.trim()) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    if (raw.replace(/\D/g, '') === '0') {
      setDisplayValue('0');
      onChange(0);
      return;
    }

    let numeric = sanitizeDigitsOnly(raw);
    if (numeric > max) numeric = max;
    if (numeric < min) numeric = min;

    const formatted = numeric > 0 ? formatIntegerRupiah(numeric) : '';
    setDisplayValue(formatted);
    onChange(numeric);

    // Smoothly restore cursor position across thousand-dot insertion
    requestAnimationFrame(() => {
      if (!inputEl) return;
      let targetPos = 0;
      let count = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          count++;
        }
        if (count >= digitsBeforeCursor) {
          targetPos = i + 1;
          break;
        }
      }
      if (count < digitsBeforeCursor) {
        targetPos = formatted.length;
      }
      inputEl.setSelectionRange(targetPos, targetPos);
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const safeValue =
      typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
    setDisplayValue(safeValue > 0 ? formatIntegerRupiah(safeValue) : '');
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E] mb-1.5"
        >
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-xl border bg-white transition-all ${
          errorText
            ? 'border-[#C46A4E] ring-2 ring-[#C46A4E]/15'
            : 'border-[#DFD8CC] focus-within:border-[#4F5D48] focus-within:ring-2 focus-within:ring-[#4F5D48]/15'
        } ${disabled ? 'opacity-55 bg-[#FAF8F5] cursor-not-allowed' : ''}`}
      >
        {prefix && (
          <span
            className={`${
              compact ? 'pl-2.5 pr-1 text-xs' : 'pl-3.5 pr-1.5 text-xs'
            } font-semibold text-[#8C8279] select-none`}
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          disabled={disabled}
          value={displayValue ?? ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full ${compact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'} ${
            prefix ? 'pl-1' : 'pl-3.5'
          } ${
            suffix ? 'pr-10' : 'pr-3.5'
          } bg-transparent text-[#2A2421] font-semibold tabular-nums focus:outline-none`}
        />
        {suffix && (
          <span className="pr-3.5 pl-1.5 text-xs font-medium text-[#8C8279] select-none">
            {suffix}
          </span>
        )}
      </div>
      {errorText ? (
        <p className="mt-1 text-xs font-medium text-[#C46A4E]">{errorText}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#7D736B]">{helperText}</p>
      ) : null}
    </div>
  );
}
