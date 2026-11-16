import { describe, expect, it } from 'vitest';
import { amountInWords, addDaysISO, formatAmount, parseAmount } from './money';

describe('money helpers', () => {
  it('writes Persian amounts in words', () => {
    expect(amountInWords(0, 'IRT', 'fa')).toBe('صفر تومان');
    expect(amountInWords(163_391_000, 'IRT', 'fa')).toBe('یکصد و شصت و سه میلیون و سیصد و نود و یک هزار تومان');
    expect(amountInWords(1250, 'USD', 'fa')).toContain('یک هزار و دویست و پنجاه');
  });

  it('writes English amounts in words', () => {
    expect(amountInWords(0, 'USD', 'en')).toBe('Zero USD');
    expect(amountInWords(163_391_000, 'IRT', 'en')).toBe('One hundred sixty-three million three hundred ninety-one thousand Toman');
    expect(amountInWords(101, 'EUR', 'en')).toContain('One hundred one');
  });

  it('parses grouped and Persian digits', () => {
    expect(parseAmount('۱۲٬۵۰۰٬۰۰۰')).toBe(12_500_000);
    expect(parseAmount('1,250,000')).toBe(1_250_000);
    expect(parseAmount('')).toBe(0);
  });

  it('formats grouped numbers per locale', () => {
    expect(formatAmount(1234567, 'en')).toBe('1,234,567');
    expect(formatAmount(1234567, 'fa')).toMatch(/[۱-۹]/);
  });

  it('adds days without breaking ISO dates', () => {
    expect(addDaysISO('2026-01-01', 14)).toBe('2026-01-15');
    expect(addDaysISO('2026-12-30', 5)).toBe('2027-01-04');
  });
});
