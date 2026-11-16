import markDark from '../assets/mark-dark.png';
import { formatAmount, formatDate, formatMoney } from '../lib/money';
import { installmentSchedule, invoiceTotals, itemNet } from '../lib/model';
import { amountInWords } from '../lib/money';
import { currencyLabel, formatNumber, PAYMENT_LABEL, STATUS_LABEL, STATUS_STAMP, t } from '../i18n';
import type { InvoiceDoc, Party } from '../types';

interface Props {
  doc: InvoiceDoc;
}

function lines(lang: InvoiceDoc['settings']['lang'], party: Party): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (party.contact.trim()) rows.push({ label: lang === 'fa' ? 'رابط' : 'Contact', value: party.contact });
  if (party.phone.trim()) rows.push({ label: lang === 'fa' ? 'تلفن' : 'Phone', value: party.phone });
  if (party.email.trim()) rows.push({ label: lang === 'fa' ? 'ایمیل' : 'Email', value: party.email });
  const place = [party.city.trim(), party.postalCode.trim()].filter(Boolean).join(' · ');
  if (party.address.trim()) rows.push({ label: lang === 'fa' ? 'نشانی' : 'Address', value: party.address });
  if (place) rows.push({ label: lang === 'fa' ? 'شهر / کد پستی' : 'City / ZIP', value: place });
  if (party.nationalId.trim()) rows.push({ label: lang === 'fa' ? 'شناسه ملی' : 'Tax ID', value: party.nationalId });
  return rows;
}

function PartyBlock({ party, title, lang }: { party: Party; title: string; lang: InvoiceDoc['settings']['lang'] }) {
  return (
    <section className="i-party">
      <p className="i-party__label">{title}</p>
      <h3 className="i-party__name">{party.name || '—'}</h3>
      <div className="i-party__rows">
        {lines(lang, party).map((row) => (
          <p key={row.label}><span>{row.label}</span>{row.value}</p>
        ))}
      </div>
    </section>
  );
}

export function InvoiceSheet({ doc }: Props) {
  const { settings, meta, seller, buyer, items, payment } = doc;
  const lang = settings.lang;
  const totals = invoiceTotals(doc);
  const schedule = installmentSchedule(doc);
  const currency = currencyLabel(meta.currency, lang);
  const stamp = t(lang, STATUS_STAMP[meta.status]);

  return (
    <article id="invoice-sheet" className={`sheet sheet--${settings.template} density--${settings.density}`} dir={lang === 'fa' ? 'rtl' : 'ltr'} lang={lang}>
      <header className="i-head">
        <div className="i-brand">
          {doc.logo ? (
            <img className="i-logo" src={doc.logo} alt="" />
          ) : (
            <div className="i-logo i-logo--fallback" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
                <path d="M9 8h6M9 12h6M9 16h3" />
              </svg>
            </div>
          )}
          <div className="i-brand__text">
            <h1>{seller.name || (lang === 'fa' ? 'نام فروشنده' : 'Seller name')}</h1>
            <p>{seller.city || (lang === 'fa' ? 'ایران' : 'Iran')}</p>
          </div>
        </div>
        <div className="i-title">
          <p className="i-title__kicker">{t(lang, 'invoiceLabel')}</p>
          <h2>{t(lang, 'invoiceShort')} <span dir="ltr">#{meta.number}</span></h2>
          <dl className="i-title__meta">
            <div><dt>{t(lang, 'issueShort')}</dt><dd>{formatDate(meta.issueDate, lang)}</dd></div>
            <div><dt>{t(lang, 'dueShort')}</dt><dd>{formatDate(meta.dueDate, lang)}</dd></div>
            <div><dt>{t(lang, 'status')}</dt><dd>{t(lang, STATUS_LABEL[meta.status])}</dd></div>
          </dl>
        </div>
      </header>

      <div className="i-parties">
        <PartyBlock party={seller} title={t(lang, 'seller')} lang={lang} />
        <PartyBlock party={buyer} title={t(lang, 'billTo')} lang={lang} />
      </div>

      <section className="i-items">
        <table>
          <thead>
            <tr>
              <th className="i-col-no">{t(lang, 'no')}</th>
              <th>{t(lang, 'description')}</th>
              <th className="i-col-num">{t(lang, 'qtyShort')}</th>
              <th className="i-col-num">{t(lang, 'priceShort')}</th>
              <th className="i-col-num">{t(lang, 'discountShort')}</th>
              <th className="i-col-num">{t(lang, 'totalShort')}</th>
            </tr>
          </thead>
          <tbody>
            {items.filter((item) => item.title.trim() || item.unitPrice > 0).map((item, index) => (
              <tr key={item.id} className="i-item">
                <td className="i-col-no">{formatNumber(index + 1, lang)}</td>
                <td className="i-item__desc">
                  <strong>{item.title || '—'}</strong>
                  {item.description.trim() ? <span>{item.description}</span> : null}
                </td>
                <td className="i-col-num">{formatNumber(item.qty, lang)}</td>
                <td className="i-col-num">{formatAmount(item.unitPrice, lang)}</td>
                <td className="i-col-num">{item.discount ? `${formatNumber(item.discount, lang)}٪` : '—'}</td>
                <td className="i-col-num i-item__total">{formatAmount(itemNet(item), lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.every((item) => !item.title.trim() && !item.unitPrice) ? (
          <p className="i-items__empty">{t(lang, 'itemsEmpty')}</p>
        ) : null}
      </section>

      <div className="i-lower">
        <section className="i-pay">
          <p className="i-block__title">{t(lang, 'paymentMethod')}</p>
          <p className="i-pay__method">{t(lang, PAYMENT_LABEL[payment.method])}</p>
          {payment.method === 'cash' ? (
            <div className="i-pay__rows">
              <p><span>{t(lang, 'paidAmount')}</span><strong>{formatMoney(totals.paid, meta.currency, lang)}</strong></p>
              <p><span>{t(lang, 'remaining')}</span><strong>{formatMoney(totals.balance, meta.currency, lang)}</strong></p>
            </div>
          ) : null}
          {payment.method === 'cheque' ? (
            <div className="i-pay__rows">
              <p><span>{t(lang, 'chequeAmount')}</span><strong>{formatMoney(payment.cheque.amount, meta.currency, lang)}</strong></p>
              <p><span>{t(lang, 'chequeSerial')}</span><b>{payment.cheque.serial || '—'}</b></p>
              <p><span>{t(lang, 'chequeBank')}</span><b>{payment.cheque.bank || '—'}</b></p>
              <p><span>{t(lang, 'chequeHolder')}</span><b>{payment.cheque.holder || '—'}</b></p>
              <p><span>{t(lang, 'chequeDue')}</span><b>{formatDate(payment.cheque.dueDate, lang)}</b></p>
            </div>
          ) : null}
          {payment.method === 'installment' ? (
            <div className="i-pay__rows">
              <p><span>{t(lang, 'downPayment')}</span><strong>{formatMoney(payment.installment.downPayment, meta.currency, lang)}</strong></p>
              <p><span>{t(lang, 'installmentCount')}</span><b>{formatNumber(payment.installment.count, lang)}</b></p>
              <p><span>{t(lang, 'firstDue')}</span><b>{formatDate(payment.installment.firstDue, lang)}</b></p>
            </div>
          ) : null}
          {schedule.length ? (
            <table className="i-schedule">
              <thead>
                <tr><th>{t(lang, 'installmentDue')}</th><th>{t(lang, 'amount')}</th></tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.index}>
                    <td>{formatDate(row.due, lang)}</td>
                    <td>{formatAmount(row.amount, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>

        <section className="i-totals">
          <p className="i-block__title">{t(lang, 'total')} <span>{currency}</span><span className={`i-stamp i-stamp--${meta.status}`}>{stamp}</span></p>
          <dl>
            <div><dt>{t(lang, 'subtotal')}</dt><dd>{formatAmount(totals.subtotal, lang)}</dd></div>
            {totals.discount ? <div><dt>{t(lang, 'invoiceDiscount')}</dt><dd>−{formatAmount(totals.discount, lang)}</dd></div> : null}
            {totals.tax ? <div><dt>{t(lang, 'tax')} ({formatNumber(doc.taxRate, lang)}٪)</dt><dd>{formatAmount(totals.tax, lang)}</dd></div> : null}
            {totals.shipping ? <div><dt>{t(lang, 'shipping')}</dt><dd>{formatAmount(totals.shipping, lang)}</dd></div> : null}
            {totals.previousBalance ? <div><dt>{t(lang, 'previousBalance')}</dt><dd>{formatAmount(totals.previousBalance, lang)}</dd></div> : null}
            <div className="i-totals__grand"><dt>{t(lang, 'total')}</dt><dd>{formatMoney(totals.total, meta.currency, lang)}</dd></div>
            {totals.paid ? <div><dt>{t(lang, 'paid')}</dt><dd>−{formatMoney(totals.paid, meta.currency, lang)}</dd></div> : null}
            {totals.balance !== totals.total ? <div className="i-totals__balance"><dt>{t(lang, 'balance')}</dt><dd>{formatMoney(totals.balance, meta.currency, lang)}</dd></div> : null}
          </dl>
        </section>
      </div>

      <p className="i-words"><span>{t(lang, 'amountInWords')}:</span> {amountInWords(totals.total, meta.currency, lang)}</p>

      {doc.notes.trim() || doc.terms.trim() ? (
        <div className="i-notes">
          {doc.notes.trim() ? <section><p className="i-block__title">{t(lang, 'notes')}</p><p>{doc.notes}</p></section> : null}
          {doc.terms.trim() ? <section><p className="i-block__title">{t(lang, 'terms')}</p><p>{doc.terms}</p></section> : null}
        </div>
      ) : null}

      <footer className="i-foot">
        <div className="i-signatures">
          <div className="i-sign">
            <p className="i-sign__label">{t(lang, 'signatureSeller')}</p>
            {doc.signature ? <img className="i-sign__image" src={doc.signature} alt="" /> : <span className="i-sign__space" />}
            <p className="i-sign__hint">{t(lang, 'signatureArea')}</p>
          </div>
          <div className="i-sign">
            <p className="i-sign__label">{t(lang, 'signatureBuyer')}</p>
            <span className="i-sign__space" />
            <p className="i-sign__hint">{t(lang, 'signatureArea')}</p>
          </div>
        </div>
        {settings.showPromo ? (
          <div className="i-promo">
            <img src={markDark} alt="" />
            <span>{t(lang, 'promoFooter')}</span>
            <span className="i-promo__url">noxaplus.ir</span>
          </div>
        ) : null}
      </footer>
    </article>
  );
}
