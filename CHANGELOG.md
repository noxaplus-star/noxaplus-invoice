# Changelog

All notable changes to NoxaPlus Invoice Desk are documented here.

## [1.0.0] — 2026-11-16

Initial public release.

### Added

- Live A4 invoice preview with measured page count, fit/actual zoom, and print-perfect PDF output.
- Complete seller and buyer blocks: contact person, phone, email, national/tax ID, city, postal code and address.
- Logo and signature upload with local resizing and optimization; a clean invoice-glyph fallback when no logo is set.
- Line items with description, quantity, unit price and per-line discount, plus reorder and remove controls.
- Invoice discount, tax rate, shipping, previous balance, paid amount and balance with automatic totals.
- Cash, cheque and installment payment methods, including cheque serial, bank, holder and due date, and an automatic dated installment schedule.
- Amount in words in Persian and English with Toman, Rial, USD, EUR and AED support.
- Automatic invoice numbers (`NP-<year>-<0000>`), issue and due dates, and draft / unpaid / paid statuses with printable stamps.
- Eight-point readiness reviewer with a score ring and plain-language hints.
- Saved buyer address book (up to twelve) and a separately persisted seller profile.
- Three A4 templates (Classic, Modern, Minimal), cozy/compact density, four accents and light/dark interface themes.
- Persian and English interface with RTL/LTR layouts, Jalali/Gregorian dates and localized digits.
- Compressed share links in the URL hash (`#i=...`), native device sharing, JSON export/import, and invoice duplication.
- Privacy-first autosave in `localStorage`; no account, backend or analytics.
- Installable PWA with a service worker, plus a self-contained single-file `index.html` at the repository root.
- Unit tests for totals, payments, installment math, normalization, number spelling and share round-trips.
