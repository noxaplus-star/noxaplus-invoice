import { describe, expect, it } from 'vitest';
import { createEmptyInvoice, installmentSchedule, invoiceChecks, invoiceTotals, makeSample, normalizeDoc, nextInvoiceNumber } from './model';

describe('invoice model', () => {
  it('calculates sample totals with item and invoice discounts', () => {
    const doc = makeSample('fa');
    const totals = invoiceTotals(doc);
    expect(totals.subtotal).toBe(154_500_000);
    expect(totals.discount).toBe(4_600_000);
    expect(totals.tax).toBe(13_491_000);
    expect(totals.total).toBe(163_391_000);
    expect(totals.balance).toBe(163_391_000);
  });

  it('applies cash and down payments to the balance', () => {
    const doc = makeSample('fa');
    doc.payment.method = 'cash';
    doc.payment.cashPaid = 20_000_000;
    expect(invoiceTotals(doc).balance).toBe(143_391_000);
    doc.meta.status = 'paid';
    expect(invoiceTotals(doc).balance).toBe(0);
  });

  it('splits installments and keeps the exact total', () => {
    const doc = makeSample('fa');
    doc.payment.method = 'installment';
    doc.payment.installment = { downPayment: 13_391_000, count: 3, intervalDays: 30, firstDue: '2026-12-01' };
    const rows = installmentSchedule(doc);
    expect(rows).toHaveLength(3);
    expect(rows.reduce((sum, row) => sum + row.amount, 0)).toBe(150_000_000);
    expect(rows[0].due).toBe('2026-12-01');
    expect(rows[1].due).toBe('2026-12-31');
  });

  it('reports a complete sample as ready', () => {
    const doc = makeSample('en');
    const review = invoiceChecks(doc);
    expect(review.passed).toBe(review.checks.length);
    expect(review.score).toBe(100);
  });

  it('normalizes untrusted documents safely', () => {
    const doc = createEmptyInvoice('en');
    const raw = {
      ...doc,
      version: 1,
      logo: 'javascript:alert(1)',
      items: [{ id: 5, title: 4, qty: -3, unitPrice: '1200', discount: 500 }],
      taxRate: 300,
      meta: { ...doc.meta, status: 'weird', currency: 'GBP' },
      settings: { ...doc.settings, theme: 'neon', template: 'modern' },
    };
    const normalized = normalizeDoc(raw);
    expect(normalized).not.toBeNull();
    expect(normalized?.logo).toBeNull();
    expect(normalized?.items[0]).toMatchObject({ qty: 0, unitPrice: 1200, discount: 100, title: '' });
    expect(normalized?.taxRate).toBe(100);
    expect(normalized?.meta.status).toBe('unpaid');
    expect(normalized?.meta.currency).toBe('IRT');
    expect(normalized?.settings.theme).toBe('light');
    expect(normalized?.settings.template).toBe('modern');
    expect(normalizeDoc({ ...raw, version: 2 })).toBeNull();
  });

  it('generates readable invoice numbers', () => {
    expect(nextInvoiceNumber()).toMatch(/^NP-\d{4}-\d{4}$/);
  });
});
