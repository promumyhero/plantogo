import { describe, it, expect } from 'vitest';
import { formatIntegerRupiah, sanitizeDigitsOnly } from '@/components/ui/numeric-currency-input';
import { filterInputByMode } from '@/components/ui/strict-text-input';

describe('Strict Input Validation & Formatting Rules (Section 5.1)', () => {
  it('NumericCurrencyInput: strips letters and symbols, keeping only integer digits', () => {
    expect(sanitizeDigitsOnly('Rp 1.500.000abc')).toBe(1500000);
    expect(sanitizeDigitsOnly('---abc###')).toBe(0);
    expect(sanitizeDigitsOnly('250000')).toBe(250000);
  });

  it('NumericCurrencyInput: formats integer Rupiah with dot thousand separators', () => {
    expect(formatIntegerRupiah(1500000)).toBe('1.500.000');
    expect(formatIntegerRupiah(75000)).toBe('75.000');
    expect(formatIntegerRupiah(0)).toBe('');
  });

  it('StrictTextInput: person_name mode rejects numbers and special symbols while keeping letters', () => {
    expect(filterInputByMode('Ridho123 Hery!@#', 'person_name')).toBe('Ridho Hery');
    expect(filterInputByMode("Andi D'Arc", 'person_name')).toBe("Andi D'Arc");
  });

  it('StrictTextInput: email mode strips spaces and converts to lowercase', () => {
    expect(filterInputByMode('  Budi.Santoso @ GMAIL.COM ', 'email')).toBe(
      'budi.santoso@gmail.com'
    );
  });
});

