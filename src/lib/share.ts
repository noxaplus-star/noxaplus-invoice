import type { InvoiceDoc } from '../types';
import { normalizeDoc } from './model';

const IMAGE_LIMIT = 12000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function packDocSync(doc: InvoiceDoc, stripImages: boolean): string {
  const payload = stripImages ? { ...doc, logo: null, signature: null } : doc;
  return `j${toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))}`;
}

export function unpackDocSync(payload: string): InvoiceDoc | null {
  if (!payload.startsWith('j')) return null;
  try {
    return normalizeDoc(JSON.parse(new TextDecoder().decode(fromBase64Url(payload.slice(1)))));
  } catch {
    return null;
  }
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

export function packDoc(doc: InvoiceDoc): Promise<string> {
  return gzip(new TextEncoder().encode(JSON.stringify(doc))).then((compressed) => {
    if (!compressed) return packDocSync(doc, false);
    return `z${toBase64Url(compressed)}`;
  });
}

export async function unpackDoc(payload: string): Promise<InvoiceDoc | null> {
  if (payload.startsWith('j')) return unpackDocSync(payload);
  if (!payload.startsWith('z')) return null;
  try {
    const inflated = await gunzip(fromBase64Url(payload.slice(1)));
    if (!inflated) return null;
    return normalizeDoc(JSON.parse(new TextDecoder().decode(inflated)));
  } catch {
    return null;
  }
}

export async function buildShareUrl(doc: InvoiceDoc, base: string): Promise<{ url: string; stripped: boolean }> {
  const full = await packDoc(doc);
  if (full.length <= IMAGE_LIMIT) return { url: `${base}#i=${full}`, stripped: false };
  const stripped = await packDoc({ ...doc, logo: null, signature: null });
  return { url: `${base}#i=${stripped}`, stripped: true };
}

export async function readShareHash(hash: string): Promise<InvoiceDoc | null> {
  const value = hash.replace(/^#/, '');
  if (!value.startsWith('i=')) return null;
  return unpackDoc(value.slice(2));
}
