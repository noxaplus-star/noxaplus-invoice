import vazirmatnCss from '@fontsource-variable/vazirmatn/index.css?raw';
import vazArabic from '@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2?inline';
import vazLatin from '@fontsource-variable/vazirmatn/files/vazirmatn-latin-wght-normal.woff2?inline';
import vazLatinExt from '@fontsource-variable/vazirmatn/files/vazirmatn-latin-ext-wght-normal.woff2?inline';
import vazirmatnLicense from '../node_modules/@fontsource-variable/vazirmatn/LICENSE?raw';

const fontFiles: Record<string, string> = {
  'vazirmatn-arabic-wght-normal.woff2': vazArabic,
  'vazirmatn-latin-wght-normal.woff2': vazLatin,
  'vazirmatn-latin-ext-wght-normal.woff2': vazLatinExt,
};

export const FONT_LICENSES = `Vazirmatn\n${vazirmatnLicense}`;

export const FONT_CSS = vazirmatnCss
  .replace(/url\(\.\/files\/([^)]+)\)/g, (_match, file: string) => `url("${fontFiles[file]}")`)
  .replaceAll('Vazirmatn Variable', 'Vazirmatn') + `\n/* ${FONT_LICENSES.replaceAll('*/', '* /')} */`;
