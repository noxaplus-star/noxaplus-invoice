import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const tile = `${root}public/icons/logo-tile.png`;

for (const [name, size] of [['favicon-32', 32], ['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
  await sharp(tile).resize(size, size).png().toFile(`${root}public/icons/${name}.png`);
}

const mark = await sharp(tile).resize(360, 360).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0b0f12' } })
  .composite([{ input: mark, left: 76, top: 76 }])
  .png()
  .toFile(`${root}public/icons/maskable-512.png`);

const banner = await sharp(`${root}docs/brand.png`).resize(1040, 312, { fit: 'contain', background: { r: 245, g: 242, b: 236, alpha: 1 } }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#f5f2ec' } })
  .composite([
    { input: banner, left: 80, top: 110 },
    {
      input: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect x="80" y="470" width="1040" height="2" fill="#d8d1c4"/><text x="80" y="525" font-family="Arial, sans-serif" font-size="24" fill="#56616e">Live A4 invoice preview · Logo &amp; signatures · Cash, cheque &amp; installments · Print-perfect PDF</text><text x="80" y="568" font-family="Arial, sans-serif" font-size="18" letter-spacing="2" fill="#4338ca">N O X A P L U S . I R</text></svg>',
      ),
      left: 0,
      top: 0,
    },
  ])
  .png()
  .toFile(`${root}public/og.png`);

console.log('Invoice Desk icons and social image generated.');
