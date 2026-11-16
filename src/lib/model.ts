import type {
  Accent,
  BuyerRecord,
  ChequeDetails,
  Currency,
  Density,
  InstallmentPlan,
  InvoiceDoc,
  InvoiceItem,
  InvoiceStatus,
  Lang,
  Party,
  PaymentMethod,
  Settings,
  Template,
  Theme,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import type { MsgKey } from '../i18n';
import { addDaysISO, todayISO } from './money';

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function emptyParty(): Party {
  return { name: '', contact: '', phone: '', email: '', nationalId: '', address: '', city: '', postalCode: '' };
}

export function newItem(): InvoiceItem {
  return { id: uid('it'), title: '', description: '', qty: 1, unitPrice: 0, discount: 0 };
}

function currentPersianYear(): string {
  try {
    const formatted = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' }).format(new Date());
    return formatted.replace(/[^0-9]/g, '');
  } catch {
    return String(new Date().getFullYear());
  }
}

export function nextInvoiceNumber(): string {
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `NP-${currentPersianYear()}-${suffix}`;
}

export function emptyInstallment(): InstallmentPlan {
  return { downPayment: 0, count: 3, intervalDays: 30, firstDue: addDaysISO(todayISO(), 30) };
}

export function emptyCheque(): ChequeDetails {
  return { amount: 0, serial: '', bank: '', holder: '', dueDate: addDaysISO(todayISO(), 7) };
}

export function createEmptyInvoice(lang: Lang, seller?: Party, logo?: string | null): InvoiceDoc {
  const issue = todayISO();
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS, lang },
    logo: logo ?? null,
    signature: null,
    seller: seller ? { ...seller } : emptyParty(),
    buyer: emptyParty(),
    meta: {
      number: nextInvoiceNumber(),
      issueDate: issue,
      dueDate: addDaysISO(issue, 14),
      status: 'unpaid',
      currency: 'IRT',
    },
    items: [newItem()],
    discount: 0,
    taxRate: 0,
    shipping: 0,
    previousBalance: 0,
    payment: { method: 'cash', cashPaid: 0, installment: emptyInstallment(), cheque: emptyCheque() },
    notes: '',
    terms: '',
    updatedAt: new Date().toISOString(),
  };
}

function sampleSeller(lang: Lang): Party {
  return lang === 'fa'
    ? {
        name: 'استودیو نوکساپلاس',
        contact: 'نیلوفر رحیمی',
        phone: '۰۲۱ ۸۸۰۰ ۱۱۲۲',
        email: 'hello@noxaplus.ir',
        nationalId: '۱۴۰۰۹۹۸۸۷۷۶',
        address: 'خیابان ولیعصر، پلاک ۱۲۴، طبقهٔ سوم',
        city: 'تهران',
        postalCode: '۱۹۶۸۸۳۴۱۱۱',
      }
    : {
        name: 'NoxaPlus Studio',
        contact: 'Niloofar Rahimi',
        phone: '+98 21 8800 1122',
        email: 'hello@noxaplus.ir',
        nationalId: '14009988776',
        address: 'Valiasr St., No. 124, 3rd floor',
        city: 'Tehran',
        postalCode: '1968834111',
      };
}

function sampleBuyer(lang: Lang): Party {
  return lang === 'fa'
    ? {
        name: 'شرکت آرمان‌تک',
        contact: 'سارا احمدی',
        phone: '۰۲۱ ۸۸۷۷ ۶۶۵۵',
        email: 'finance@armantech.ir',
        nationalId: '۱۰۱۰۴۵۶۷۸۹۰',
        address: 'بزرگراه شهید حقانی، برج نگین، واحد ۱۲',
        city: 'تهران',
        postalCode: '۱۹۹۳۷۱۴۴۱۱',
      }
    : {
        name: 'ArmanTech Co.',
        contact: 'Sara Ahmadi',
        phone: '+98 21 8877 6655',
        email: 'finance@armantech.ir',
        nationalId: '10104567890',
        address: 'Haghani Highway, Negin Tower, Unit 12',
        city: 'Tehran',
        postalCode: '1993714411',
      };
}

function sampleItems(lang: Lang): InvoiceItem[] {
  if (lang === 'fa') {
    return [
      { id: uid('it'), title: 'طراحی رابط و تجربهٔ کاربری اپلیکیشن', description: 'پژوهش، وایرفریم و طراحی نهایی ۱۲ صفحه', qty: 1, unitPrice: 42_000_000, discount: 0 },
      { id: uid('it'), title: 'پیاده‌سازی فرانت‌اند', description: 'React و TypeScript، ۱۲۰ ساعت کار', qty: 120, unitPrice: 850_000, discount: 5 },
      { id: uid('it'), title: 'تست و تضمین کیفیت', description: 'تست دستی، بررسی دسترس‌پذیری و رفع ایراد', qty: 24, unitPrice: 650_000, discount: 0 },
    ];
  }
  return [
    { id: uid('it'), title: 'Product and UX design', description: 'Research, wireframes and 12 final screens', qty: 1, unitPrice: 42_000_000, discount: 0 },
    { id: uid('it'), title: 'Front-end implementation', description: 'React and TypeScript, 120 hours', qty: 120, unitPrice: 850_000, discount: 5 },
    { id: uid('it'), title: 'Testing and quality assurance', description: 'Manual testing, accessibility review and fixes', qty: 24, unitPrice: 650_000, discount: 0 },
  ];
}

export function makeSample(lang: Lang, settings?: Partial<Settings>): InvoiceDoc {
  const issue = todayISO();
  const base = createEmptyInvoice(lang, sampleSeller(lang));
  const items = sampleItems(lang);
  const gross = items.reduce((sum, item) => sum + Math.round(item.qty * item.unitPrice * (1 - item.discount / 100)), 0);
  const discount = lang === 'fa' ? 4_600_000 : 4_600_000;
  const taxRate = 9;
  const net = Math.max(0, gross - discount);
  const total = net + Math.round(net * taxRate / 100);
  return {
    ...base,
    settings: { ...base.settings, ...settings, lang },
    buyer: sampleBuyer(lang),
    meta: {
      number: nextInvoiceNumber(),
      issueDate: issue,
      dueDate: addDaysISO(issue, 14),
      status: 'unpaid',
      currency: 'IRT',
    },
    items,
    discount,
    taxRate,
    shipping: 0,
    previousBalance: 0,
    payment: {
      method: 'cheque',
      cashPaid: 0,
      installment: { downPayment: 0, count: 3, intervalDays: 30, firstDue: addDaysISO(issue, 30) },
      cheque: {
        amount: total,
        serial: lang === 'fa' ? '۱۲۳۴۵۶۷۸' : '12345678',
        bank: lang === 'fa' ? 'بانک ملت' : 'Bank Mellat',
        holder: lang === 'fa' ? 'استودیو نوکساپلاس' : 'NoxaPlus Studio',
        dueDate: addDaysISO(issue, 7),
      },
    },
    notes: lang === 'fa'
      ? 'پرداخت به حساب جاری بانک ملت به نام استودیو نوکساپلاس. لطفاً شمارهٔ فاکتور را در توضیحات واریز بنویسید.'
      : 'Payment to the Bank Mellat account of NoxaPlus Studio. Please include the invoice number in the transfer note.',
    terms: lang === 'fa'
      ? 'فاکتور پس از تأیید خریدار معتبر است. تغییرات خارج از این فهرست با توافق کتبی انجام می‌شود.'
      : 'This invoice is valid after the buyer confirms it. Work outside this list is agreed in writing.',
    updatedAt: new Date().toISOString(),
  };
}

export function touch(doc: InvoiceDoc): InvoiceDoc {
  return { ...doc, updatedAt: new Date().toISOString() };
}

export function updateSettings(doc: InvoiceDoc, patch: Partial<Settings>): InvoiceDoc {
  return touch({ ...doc, settings: { ...doc.settings, ...patch } });
}

export function itemNet(item: InvoiceItem): number {
  const gross = Math.round(Math.max(0, item.qty) * Math.max(0, item.unitPrice));
  const discount = Math.min(100, Math.max(0, item.discount));
  return Math.round(gross * (1 - discount / 100));
}

export interface Totals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  shipping: number;
  previousBalance: number;
  total: number;
  paid: number;
  balance: number;
}

export function invoiceTotals(doc: InvoiceDoc): Totals {
  const subtotal = doc.items.reduce((sum, item) => sum + itemNet(item), 0);
  const discount = Math.min(subtotal, Math.max(0, Math.round(doc.discount)));
  const shipping = Math.max(0, Math.round(doc.shipping));
  const taxable = subtotal - discount + shipping;
  const tax = Math.round(taxable * Math.min(100, Math.max(0, doc.taxRate)) / 100);
  const previousBalance = Math.max(0, Math.round(doc.previousBalance));
  const total = taxable + tax + previousBalance;
  let paid = 0;
  if (doc.meta.status === 'paid') {
    paid = total;
  } else if (doc.payment.method === 'cash') {
    paid = Math.min(total, Math.max(0, Math.round(doc.payment.cashPaid)));
  } else if (doc.payment.method === 'installment') {
    paid = Math.min(total, Math.max(0, Math.round(doc.payment.installment.downPayment)));
  }
  return { subtotal, discount, tax, shipping, previousBalance, total, paid, balance: Math.max(0, total - paid), taxable };
}

export interface ScheduleRow {
  index: number;
  due: string;
  amount: number;
}

export function installmentSchedule(doc: InvoiceDoc): ScheduleRow[] {
  if (doc.payment.method !== 'installment') return [];
  const plan = doc.payment.installment;
  const count = Math.min(24, Math.max(1, Math.round(plan.count)));
  const total = invoiceTotals(doc).total;
  const remaining = Math.max(0, total - Math.max(0, Math.round(plan.downPayment)));
  if (remaining <= 0) return [];
  const base = Math.floor(remaining / count);
  const rows: ScheduleRow[] = [];
  for (let index = 0; index < count; index += 1) {
    const amount = index === count - 1 ? remaining - base * (count - 1) : base;
    rows.push({ index: index + 1, due: addDaysISO(plan.firstDue, index * Math.max(1, Math.round(plan.intervalDays))), amount });
  }
  return rows;
}

export interface CheckItem {
  label: MsgKey;
  ok: boolean;
}

export function invoiceChecks(doc: InvoiceDoc): { checks: CheckItem[]; passed: number; score: number } {
  const totals = invoiceTotals(doc);
  const seller = doc.seller;
  const buyer = doc.buyer;
  const cheque = doc.payment.cheque;
  const plan = doc.payment.installment;
  const checks: CheckItem[] = [
    { label: 'checkSeller', ok: Boolean(seller.name.trim() && (seller.phone.trim() || seller.email.trim()) && seller.address.trim()) },
    { label: 'checkBuyer', ok: Boolean(buyer.name.trim() && (buyer.phone.trim() || buyer.email.trim() || buyer.nationalId.trim()) && buyer.address.trim()) },
    { label: 'checkItems', ok: doc.items.some((item) => item.title.trim() && item.qty > 0 && item.unitPrice > 0) },
    { label: 'checkPricing', ok: totals.subtotal > 0 && doc.items.every((item) => item.qty >= 0 && item.unitPrice >= 0 && item.discount >= 0 && item.discount <= 100) },
    { label: 'checkDates', ok: Boolean(doc.meta.issueDate && doc.meta.dueDate && doc.meta.dueDate >= doc.meta.issueDate) },
    {
      label: 'checkPayment',
      ok: doc.payment.method === 'cash'
        ? doc.payment.cashPaid > 0
        : doc.payment.method === 'cheque'
          ? Boolean(cheque.serial.trim() && cheque.bank.trim() && cheque.holder.trim() && cheque.amount > 0)
          : Boolean(plan.count > 0 && plan.firstDue),
    },
    { label: 'checkTerms', ok: (doc.notes.trim() || doc.terms.trim()).length > 10 },
    { label: 'checkSignature', ok: Boolean(seller.name.trim() && buyer.name.trim()) },
  ];
  const passed = checks.filter((check) => check.ok).length;
  return { checks, passed, score: Math.round((passed / checks.length) * 100) };
}

export function matchesSample(doc: InvoiceDoc): boolean {
  return doc.seller.email === 'hello@noxaplus.ir' && doc.buyer.email === 'finance@armantech.ir' && doc.items.length === 3;
}

export function partyComplete(party: Party): boolean {
  return Boolean(party.name.trim() && (party.phone.trim() || party.email.trim()));
}

export function buyerRecord(party: Party): BuyerRecord {
  return { id: uid('by'), name: party.name.trim(), party: { ...party }, savedAt: new Date().toISOString() };
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function int(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === 'string' && (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function normalizeParty(value: unknown): Party {
  const record = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  return {
    name: str(record.name),
    contact: str(record.contact),
    phone: str(record.phone),
    email: str(record.email),
    nationalId: str(record.nationalId),
    address: str(record.address),
    city: str(record.city),
    postalCode: str(record.postalCode),
  };
}

function imageValue(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('data:image/') && value.length < 2_000_000 ? value : null;
}

export function normalizeDoc(value: unknown): InvoiceDoc | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (record.version !== 1) return null;
  const settingsRecord = typeof record.settings === 'object' && record.settings !== null ? (record.settings as Record<string, unknown>) : {};
  const settings: Settings = {
    lang: oneOf<Lang>(settingsRecord.lang, ['fa', 'en'], 'fa'),
    theme: oneOf<Theme>(settingsRecord.theme, ['light', 'dark'], 'light'),
    accent: oneOf<Accent>(settingsRecord.accent, ['teal', 'indigo', 'plum', 'clay'], 'indigo'),
    template: oneOf<Template>(settingsRecord.template, ['classic', 'modern', 'minimal'], 'classic'),
    density: oneOf<Density>(settingsRecord.density, ['cozy', 'compact'], 'cozy'),
    showPromo: settingsRecord.showPromo !== false,
    zoom: oneOf(settingsRecord.zoom, ['fit', 'actual'] as const, 'fit'),
  };
  const metaRecord = typeof record.meta === 'object' && record.meta !== null ? (record.meta as Record<string, unknown>) : {};
  const paymentRecord = typeof record.payment === 'object' && record.payment !== null ? (record.payment as Record<string, unknown>) : {};
  const planRecord = typeof paymentRecord.installment === 'object' && paymentRecord.installment !== null ? (paymentRecord.installment as Record<string, unknown>) : {};
  const chequeRecord = typeof paymentRecord.cheque === 'object' && paymentRecord.cheque !== null ? (paymentRecord.cheque as Record<string, unknown>) : {};
  const items = Array.isArray(record.items)
    ? record.items.flatMap((item): InvoiceItem[] => {
        if (typeof item !== 'object' || item === null) return [];
        const row = item as Record<string, unknown>;
        return [{
          id: str(row.id) || uid('it'),
          title: str(row.title),
          description: str(row.description),
          qty: int(row.qty, 1),
          unitPrice: int(row.unitPrice),
          discount: clamp(row.discount, 0, 100, 0),
        }];
      })
    : [];
  const issueDate = str(metaRecord.issueDate) || todayISO();
  const dueDate = str(metaRecord.dueDate) || addDaysISO(issueDate, 14);
  return {
    version: 1,
    settings,
    logo: imageValue(record.logo),
    signature: imageValue(record.signature),
    seller: normalizeParty(record.seller),
    buyer: normalizeParty(record.buyer),
    meta: {
      number: str(metaRecord.number) || nextInvoiceNumber(),
      issueDate,
      dueDate,
      status: oneOf<InvoiceStatus>(metaRecord.status, ['draft', 'unpaid', 'paid'], 'unpaid'),
      currency: oneOf<Currency>(metaRecord.currency, ['IRT', 'IRR', 'USD', 'EUR', 'AED'], 'IRT'),
    },
    items: items.length ? items : [newItem()],
    discount: int(record.discount),
    taxRate: clamp(record.taxRate, 0, 100, 0),
    shipping: int(record.shipping),
    previousBalance: int(record.previousBalance),
    payment: {
      method: oneOf<PaymentMethod>(paymentRecord.method, ['cash', 'installment', 'cheque'], 'cash'),
      cashPaid: int(paymentRecord.cashPaid),
      installment: {
        downPayment: int(planRecord.downPayment),
        count: clamp(planRecord.count, 1, 24, 3),
        intervalDays: clamp(planRecord.intervalDays, 1, 365, 30),
        firstDue: str(planRecord.firstDue) || addDaysISO(todayISO(), 30),
      },
      cheque: {
        amount: int(chequeRecord.amount),
        serial: str(chequeRecord.serial),
        bank: str(chequeRecord.bank),
        holder: str(chequeRecord.holder),
        dueDate: str(chequeRecord.dueDate) || addDaysISO(todayISO(), 7),
      },
    },
    notes: str(record.notes),
    terms: str(record.terms),
    updatedAt: str(record.updatedAt) || new Date().toISOString(),
  };
}

export function normalizeBuyer(value: unknown): BuyerRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const party = normalizeParty(record.party);
  if (!party.name.trim()) return null;
  return {
    id: str(record.id) || uid('by'),
    name: party.name,
    party,
    savedAt: str(record.savedAt) || new Date().toISOString(),
  };
}
