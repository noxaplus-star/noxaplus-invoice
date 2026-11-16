import type { Currency, Lang } from '../types';
import { currencyLabel } from '../i18n';

const FA_UNITS = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const FA_TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const FA_HUNDREDS = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const FA_GROUPS = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

const EN_UNITS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const EN_GROUPS = ['', 'thousand', 'million', 'billion', 'trillion'];

function faUnder1000(value: number): string {
  const parts: string[] = [];
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  if (hundred) parts.push(FA_HUNDREDS[hundred]);
  if (rest >= 20) {
    const ten = Math.floor(rest / 10);
    const unit = rest % 10;
    parts.push(unit ? `${FA_TENS[ten]} و ${FA_UNITS[unit]}` : FA_TENS[ten]);
  } else if (rest > 0) {
    parts.push(FA_UNITS[rest]);
  }
  return parts.join(' و ');
}

function enUnder1000(value: number): string {
  const parts: string[] = [];
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  if (hundred) parts.push(`${EN_UNITS[hundred]} hundred`);
  if (rest >= 20) {
    const ten = Math.floor(rest / 10);
    const unit = rest % 10;
    parts.push(unit ? `${EN_TENS[ten]}-${EN_UNITS[unit]}` : EN_TENS[ten]);
  } else if (rest > 0) {
    parts.push(EN_UNITS[rest]);
  }
  return parts.join(' ');
}

function toWords(value: number, lang: Lang): string {
  if (!Number.isFinite(value)) return '';
  if (value === 0) return lang === 'fa' ? 'صفر' : 'zero';
  if (value < 0) return lang === 'fa' ? `منفی ${toWords(-value, lang)}` : `minus ${toWords(-value, lang)}`;
  const groups: number[] = [];
  let rest = Math.floor(value);
  while (rest > 0) {
    groups.push(rest % 1000);
    rest = Math.floor(rest / 1000);
  }
  const parts: string[] = [];
  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const group = groups[index];
    if (!group) continue;
    const text = lang === 'fa' ? faUnder1000(group) : enUnder1000(group);
    if (!text) continue;
    if (lang === 'fa') {
      parts.push(FA_GROUPS[index] ? `${text} ${FA_GROUPS[index]}` : text);
    } else {
      parts.push(EN_GROUPS[index] ? `${text} ${EN_GROUPS[index]}` : text);
    }
  }
  return parts.join(lang === 'fa' ? ' و ' : ' ');
}

export function amountInWords(amount: number, currency: Currency, lang: Lang): string {
  const value = Math.max(0, Math.round(amount));
  const words = toWords(value, lang);
  const label = currencyLabel(currency, lang);
  if (lang === 'fa') return `${words} ${label}`;
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} ${label}`;
}

export function formatMoney(amount: number, currency: Currency, lang: Lang): string {
  const number = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 0 }).format(Math.round(amount));
  return `${number} ${currencyLabel(currency, lang)}`;
}

export function formatAmount(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 0 }).format(Math.round(amount));
}

export function parseAmount(input: string): number {
  const cleaned = input.replace(/[٫٬,،\s]/g, '').replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function formatDate(iso: string, lang: Lang): string {
  if (!iso) return '—';
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-GB', {
      year: 'numeric',
      month: lang === 'fa' ? 'long' : 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return iso;
  }
}

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const base = iso ? new Date(`${iso}T12:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return todayISO();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}
