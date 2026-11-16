import { describe, expect, it } from 'vitest';
import { makeSample } from './model';
import { buildShareUrl, packDoc, packDocSync, readShareHash, unpackDoc, unpackDocSync } from './share';

describe('share links', () => {
  it('round-trips a plain payload', () => {
    const doc = makeSample('fa');
    const packed = packDocSync(doc, false);
    const restored = unpackDocSync(packed);
    expect(restored?.meta.number).toBe(doc.meta.number);
    expect(restored?.items).toHaveLength(3);
  });

  it('round-trips a compressed payload', async () => {
    const doc = makeSample('en');
    const packed = await packDoc(doc);
    expect(packed.startsWith('z')).toBe(true);
    const restored = await unpackDoc(packed);
    expect(restored?.buyer.name).toBe('ArmanTech Co.');
  });

  it('builds and reads a hash URL', async () => {
    const doc = makeSample('fa');
    const { url, stripped } = await buildShareUrl(doc, 'https://example.test/');
    expect(stripped).toBe(false);
    const hash = url.slice(url.indexOf('#'));
    expect((await readShareHash(hash))?.seller.name).toBe('استودیو نوکساپلاس');
  });

  it('rejects malformed payloads', async () => {
    expect(await unpackDoc('znot-base64')).toBeNull();
    expect(await readShareHash('#x=1')).toBeNull();
    expect(unpackDocSync('j%%%')).toBeNull();
  });
});
