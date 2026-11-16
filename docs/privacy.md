# Privacy

NoxaPlus Invoice Desk is a static, client-side application. It has no backend, no account system, no analytics and no tracking. Nothing you type is sent to a server.

## What is stored, and where

All data is stored in your browser's `localStorage` under these keys:

| Key | Contents |
| --- | --- |
| `noxaplus-invoice:doc:v1` | The current invoice: seller, buyer, logo, signature, items, totals, payment details, notes and settings. |
| `noxaplus-invoice:seller:v1` | A saved seller profile (company block, logo, signature) so the next invoice starts branded. |
| `noxaplus-invoice:buyers:v1` | Up to twelve saved buyer records for quick reuse. |

The draft is saved automatically about half a second after you stop typing. Date, language, theme, accent, template and density settings are part of the invoice document.

## Logo and signature images

Images are read locally with the File API, resized and compressed in a `<canvas>`, and stored as data URLs inside the document. They are never uploaded. Removing the logo or signature from the editor deletes the image from the stored document.

## Share links

The share dialog compresses the invoice (JSON → gzip → base64url) and puts it after `#` in the URL. A share link therefore **contains the invoice data itself**. Treat it like the invoice: anyone with the link can read it. The fragment is not sent to the web server by the browser, but it can be copied into chat or email.

If the compressed link would be too long (for example because of a large logo), the link is generated without the logo and signature and the dialog warns you. Remove personal data before sharing publicly.

## Portability and deletion

- **Export JSON** downloads the complete document for backup or hand-off.
- **Import JSON** validates version, enums and numeric ranges before loading.
- To delete everything, use **Blank invoice** and clear the site's data in your browser, or remove the keys above from `localStorage` in the developer console.

## Printing

Printing uses the browser's own print pipeline. The app does not generate a file on a server; the PDF is produced by the browser's “Save as PDF” destination.

## Third-party code

React, React DOM, Scheduler and the Vazirmatn typeface are bundled locally. Their MIT licenses are included in [THIRD-PARTY-LICENSES.txt](../THIRD-PARTY-LICENSES.txt) and inside the standalone HTML build. No CDN request is made at runtime.
