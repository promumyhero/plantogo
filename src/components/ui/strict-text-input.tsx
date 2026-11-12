'use client';

import React from 'react';

type StrictInputMode = 'person_name' | 'title_text' | 'email';

interface StrictTextInputProps {
  value: string;
  onChange: (newValue: string) => void;
  mode?: StrictInputMode;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  compact?: boolean;
  helperText?: string;
  errorText?: string;
  className?: string;
  id?: string;
}

export function filterInputByMode(raw: string, mode: StrictInputMode): string {
  if (mode === 'person_name') {
    return raw.replace(/[^a-zA-Z\s'’.-]/g, '').replace(/\s{2,}/g, ' ');
  }
  if (mode === 'email') {
    return raw.replace(/\s+/g, '').toLowerCase();
  }
  return raw.replace(/[\u0000-\u001F\u007F]/g, '');
}

export function StrictTextInput({
  value,
  onChange,
  mode = 'title_text',
  label,
  placeholder,
  maxLength = 60,
  disabled = false,
  required = false,
  compact = false,
  helperText,
  errorText,
  className = '',
  id,
}: StrictTextInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode === 'person_name') {
      const controlKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
        ' ',
      ];
      if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
        return;
      }
      if (!/^[a-zA-Z'’.-]$/.test(e.key)) {
        e.preventDefault();
      }
    } else if (mode === 'email') {
      if (e.key === ' ') {
        e.preventDefault();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = filterInputByMode(e.target.value, mode);
    onChange(filtered.slice(0, maxLength));
  };

  const handleBlur = () => {
    onChange(value.trim());
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={id}
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E655E]"
          >
            {label} {required && <span className="text-[#C46A4E]">*</span>}
          </label>
          <span className="text-[10px] tabular-nums text-[#9C9187]">
            {(value ?? '').length}/{maxLength}
          </span>
        </div>
      )}
      <input
        id={id}
        type={mode === 'email' ? 'email' : 'text'}
        inputMode={mode === 'email' ? 'email' : 'text'}
        autoCapitalize={
          mode === 'email' ? 'none' : mode === 'person_name' ? 'words' : 'sentences'
        }
        spellCheck={mode === 'email' ? false : undefined}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        value={value ?? ''}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2.5 text-sm'
        } font-medium text-[#2A2421] placeholder:text-[#A3988E] transition-all focus:outline-none ${
          errorText
            ? 'border-[#C46A4E] ring-2 ring-[#C46A4E]/15'
            : 'border-[#DFD8CC] focus:border-[#4F5D48] focus:ring-2 focus:ring-[#4F5D48]/15'
        } ${disabled ? 'opacity-55 bg-[#FAF8F5] cursor-not-allowed' : ''}`}
      />
      {errorText ? (
        <p className="mt-1 text-xs font-medium text-[#C46A4E]">{errorText}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#7D736B]">{helperText}</p>
      ) : null}
    </div>
  );
}
