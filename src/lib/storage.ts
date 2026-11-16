import type { BuyerRecord, InvoiceDoc } from '../types';
import { normalizeBuyer, normalizeDoc, normalizeParty } from './model';

const DOC_KEY = 'noxaplus-invoice:doc:v1';
const SELLER_KEY = 'noxaplus-invoice:seller:v1';
const BUYERS_KEY = 'noxaplus-invoice:buyers:v1';
const MAX_BUYERS = 12;

export interface SellerProfile {
  party: ReturnType<typeof normalizeParty>;
  logo: string | null;
  signature: string | null;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readStoredDoc(): InvoiceDoc | null {
  try {
    const raw = storage()?.getItem(DOC_KEY);
    if (!raw) return null;
    return normalizeDoc(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStoredDoc(doc: InvoiceDoc): void {
  try {
    storage()?.setItem(DOC_KEY, JSON.stringify(doc));
  } catch {
    // Quota errors must never break editing.
  }
}

export function readSellerProfile(): SellerProfile | null {
  try {
    const raw = storage()?.getItem(SELLER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const party = normalizeParty(parsed.party);
    if (!party.name.trim()) return null;
    const image = (value: unknown): string | null => (typeof value === 'string' && value.startsWith('data:image/') ? value : null);
    return { party, logo: image(parsed.logo), signature: image(parsed.signature) };
  } catch {
    return null;
  }
}

export function writeSellerProfile(profile: SellerProfile): void {
  try {
    storage()?.setItem(SELLER_KEY, JSON.stringify(profile));
  } catch {
    // Ignore quota errors.
  }
}

export function readBuyers(): BuyerRecord[] {
  try {
    const raw = storage()?.getItem(BUYERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const record = normalizeBuyer(item);
      return record ? [record] : [];
    }).slice(0, MAX_BUYERS);
  } catch {
    return [];
  }
}

export function writeBuyers(buyers: BuyerRecord[]): void {
  try {
    storage()?.setItem(BUYERS_KEY, JSON.stringify(buyers.slice(0, MAX_BUYERS)));
  } catch {
    // Ignore quota errors.
  }
}
