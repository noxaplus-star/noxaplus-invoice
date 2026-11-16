import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
let html = await readFile(`${root}dist/index.html`, 'utf8');
const sources = [
  ['NoxaPlus Invoice Desk', 'LICENSE'],
  ['React', 'node_modules/react/LICENSE'],
  ['React DOM', 'node_modules/react-dom/LICENSE'],
  ['Scheduler', 'node_modules/scheduler/LICENSE'],
  ['Vazirmatn', 'node_modules/@fontsource-variable/vazirmatn/LICENSE'],
];
const notices = (await Promise.all(sources.map(async ([name, path]) => `${name}\n${await readFile(`${root}${path}`, 'utf8')}`))).join('\n\n');
const end = html.lastIndexOf('</body>');
html = `${html.slice(0, end)}<script type="text/plain" id="third-party-licenses">${notices}</script>${html.slice(end)}`;
if (/<script[^>]+src="\.\/assets\//.test(html) || /<link[^>]+href="\.\/assets\//.test(html)) throw new Error('Standalone bundles were not inlined.');
await writeFile(`${root}dist/index.html`, html);
await writeFile(`${root}dist/THIRD-PARTY-LICENSES.txt`, notices);
await writeFile(`${root}THIRD-PARTY-LICENSES.txt`, notices);
await writeFile(`${root}index.html`, html.replace(/\s*<link rel="manifest"[^>]*>/, '').replace(/(href|content)="\.\/icons\//g, '$1="./public/icons/'));
console.log(`Standalone index.html written (${(html.length / 1024).toFixed(0)} KB).`);
