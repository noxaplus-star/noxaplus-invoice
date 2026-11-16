# Manual test checklist

A quick pass for release verification. The automated suite covers totals, payments, number spelling, normalization and share round-trips (`npm test`).

## Layout and themes

- [ ] Hero headline stays on one line in Persian and English at 1280 px and wider.
- [ ] The A4 sheet is 794 px wide on screen and prints at 210 mm.
- [ ] Fit and Actual zoom both work; the sheet does not overflow the stage horizontally.
- [ ] Light and dark interface themes switch without affecting the white invoice paper.
- [ ] All four accents update the interface, totals, stamps, buttons and invoice templates.
- [ ] Classic, Modern and Minimal templates all render header, parties, table, payment and totals.
- [ ] Cozy and Compact density both fit the sample on one A4 page.

## Editing

- [ ] Seller and buyer fields update the page immediately and empty optional fields disappear.
- [ ] Logo upload shows in the header; remove restores the invoice-glyph fallback.
- [ ] Signature upload shows above the seller signature line; remove clears it.
- [ ] Items can be added, edited, reordered, removed; line totals and grand total stay correct.
- [ ] Invoice discount, tax, shipping and previous balance recalculate the total and balance.
- [ ] Save buyer stores a record and the chip refills the buyer block; deleting a chip works.
- [ ] Invoice number regenerates; issue and due dates accept Jalali and Gregorian display.
- [ ] Draft, unpaid and paid statuses change the stamp and the hint.
- [ ] Cash, cheque and installment modes show the right fields; “full amount” fills the total.
- [ ] Installment schedule row count matches the plan and the last row absorbs rounding.
- [ ] Amount in words matches the grand total in both languages.

## Review and data

- [ ] All eight readiness checks reach 100% on a complete invoice.
- [ ] Autosave survives a reload, including logo, signature, buyer book and seller profile.
- [ ] Duplicate creates a new invoice number but keeps the content.
- [ ] JSON export downloads and JSON import restores the same document.
- [ ] Invalid or older JSON is rejected with a clear message.
- [ ] Blank invoice asks for confirmation and starts a fresh seller/buyer with today's dates.

## Share, print and offline

- [ ] Share builds `#i=` link; opening it restores the invoice.
- [ ] Oversized image data is stripped from the link with the warning visible.
- [ ] Print preview hides the app chrome and shows only the invoice.
- [ ] Save as PDF produces **one page** for the demo (check the page count).
- [ ] Printed colors, accents, logos and signatures are visible with background graphics enabled.
- [ ] Service worker serves the hosted app offline after the first visit.
- [ ] Root `index.html` opens from disk as a standalone invoice studio.

## Mobile

- [ ] Edit and Preview tabs switch correctly at 390 px.
- [ ] Editor fields are single-column and never overflow horizontally.
- [ ] Preview fits the sheet and remains scrollable; the tab bar does not cover the sheet end.
- [ ] Language, theme and template controls remain reachable.
