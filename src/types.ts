export type Lang = 'fa' | 'en';
export type Theme = 'light' | 'dark';
export type Accent = 'teal' | 'indigo' | 'plum' | 'clay';
export type Template = 'classic' | 'modern' | 'minimal';
export type Density = 'cozy' | 'compact';
export type Currency = 'IRT' | 'IRR' | 'USD' | 'EUR' | 'AED';
export type PaymentMethod = 'cash' | 'installment' | 'cheque';
export type InvoiceStatus = 'draft' | 'unpaid' | 'paid';
export type Zoom = 'fit' | 'actual';

export interface Party {
  name: string;
  contact: string;
  phone: string;
  email: string;
  nationalId: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
}

export interface InstallmentPlan {
  downPayment: number;
  count: number;
  intervalDays: number;
  firstDue: string;
}

export interface ChequeDetails {
  amount: number;
  serial: string;
  bank: string;
  holder: string;
  dueDate: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  cashPaid: number;
  installment: InstallmentPlan;
  cheque: ChequeDetails;
}

export interface InvoiceMeta {
  number: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: Currency;
}

export interface Settings {
  lang: Lang;
  theme: Theme;
  accent: Accent;
  template: Template;
  density: Density;
  showPromo: boolean;
  zoom: Zoom;
}

export interface InvoiceDoc {
  version: 1;
  settings: Settings;
  logo: string | null;
  signature: string | null;
  seller: Party;
  buyer: Party;
  meta: InvoiceMeta;
  items: InvoiceItem[];
  discount: number;
  taxRate: number;
  shipping: number;
  previousBalance: number;
  payment: PaymentInfo;
  notes: string;
  terms: string;
  updatedAt: string;
}

export interface BuyerRecord {
  id: string;
  name: string;
  party: Party;
  savedAt: string;
}

export const DEFAULT_SETTINGS: Settings = {
  lang: 'fa',
  theme: 'light',
  accent: 'indigo',
  template: 'classic',
  density: 'cozy',
  showPromo: true,
  zoom: 'fit',
};
