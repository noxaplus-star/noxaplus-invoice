import { Field } from './Fields';
import { Icon } from './Icons';
import { formatDate, formatMoney, parseAmount } from '../lib/money';
import { installmentSchedule, invoiceTotals } from '../lib/model';
import { formatNumber, PAYMENT_LABEL, t } from '../i18n';
import type { ChequeDetails, InstallmentPlan, InvoiceDoc, PaymentMethod } from '../types';

interface Props {
  doc: InvoiceDoc;
  method: (value: PaymentMethod) => void;
  cash: (value: number) => void;
  installment: (value: Partial<InstallmentPlan>) => void;
  cheque: (value: Partial<ChequeDetails>) => void;
}

const METHODS: PaymentMethod[] = ['cash', 'cheque', 'installment'];

export function PaymentEditor({ doc, method, cash, installment, cheque }: Props) {
  const lang = doc.settings.lang;
  const currency = doc.meta.currency;
  const totals = invoiceTotals(doc);
  const schedule = installmentSchedule(doc);
  const plan = doc.payment.installment;

  return (
    <div className="payment-editor">
      <div className="method-switch" role="group" aria-label={t(lang, 'paymentMethod')}>
        {METHODS.map((value) => (
          <button
            type="button"
            key={value}
            className={doc.payment.method === value ? 'is-active' : ''}
            aria-pressed={doc.payment.method === value}
            onClick={() => method(value)}
          >
            {value === 'cash' ? '◉' : value === 'cheque' ? '▤' : '▦'}
            {t(lang, PAYMENT_LABEL[value])}
          </button>
        ))}
      </div>

      {doc.payment.method === 'cash' ? (
        <div className="pay-fields">
          <Field
            label={t(lang, 'paidAmount')}
            value={String(doc.payment.cashPaid)}
            type="number"
            ltr
            onChange={(value) => cash(parseAmount(value))}
          />
          <button type="button" className="btn btn--ghost btn--sm full-btn" onClick={() => cash(totals.total)}>
            {t(lang, 'fullAmount')}
          </button>
          <p className="pay-note">{formatMoney(totals.balance, currency, lang)} · {t(lang, 'balance')}</p>
        </div>
      ) : null}

      {doc.payment.method === 'cheque' ? (
        <div className="pay-grid">
          <div className="field-grid">
            <Field label={t(lang, 'chequeAmount')} value={String(doc.payment.cheque.amount)} type="number" ltr onChange={(value) => cheque({ amount: parseAmount(value) })} />
            <button type="button" className="btn btn--ghost btn--sm full-btn" onClick={() => cheque({ amount: totals.total })}>{t(lang, 'fullAmount')}</button>
            <Field label={t(lang, 'chequeSerial')} value={doc.payment.cheque.serial} ltr onChange={(serial) => cheque({ serial })} />
            <Field label={t(lang, 'chequeBank')} value={doc.payment.cheque.bank} onChange={(bank) => cheque({ bank })} />
            <Field label={t(lang, 'chequeHolder')} value={doc.payment.cheque.holder} onChange={(holder) => cheque({ holder })} />
            <Field label={t(lang, 'chequeDue')} value={doc.payment.cheque.dueDate} type="date" onChange={(dueDate) => cheque({ dueDate })} />
          </div>
        </div>
      ) : null}

      {doc.payment.method === 'installment' ? (
        <>
          <div className="field-grid">
            <Field label={t(lang, 'downPayment')} value={String(plan.downPayment)} type="number" ltr onChange={(value) => installment({ downPayment: parseAmount(value) })} />
            <Field label={t(lang, 'installmentCount')} value={String(plan.count)} type="number" onChange={(value) => installment({ count: Math.min(24, Math.max(1, Math.round(Number(value) || 1))) })} />
            <Field label={t(lang, 'intervalDays')} value={String(plan.intervalDays)} type="number" onChange={(value) => installment({ intervalDays: Math.min(365, Math.max(1, Math.round(Number(value) || 1))) })} />
            <Field label={t(lang, 'firstDue')} value={plan.firstDue} type="date" onChange={(firstDue) => installment({ firstDue })} />
          </div>
          {schedule.length ? (
            <div className="schedule-preview">
              <div className="schedule-preview__head">
                <span>{t(lang, 'installmentsPreview')}</span>
                <strong>{formatNumber(schedule.length, lang)}</strong>
              </div>
              <ul>
                {schedule.map((row) => (
                  <li key={row.index}>
                    <span>{formatDate(row.due, lang)}</span>
                    <b>{formatMoney(row.amount, currency, lang)}</b>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      <div className={`pay-status pay-status--${doc.meta.status}`}>
        <Icon name="check" size={14} />
        <span>
          {doc.meta.status === 'draft' ? t(lang, 'statusDraftHint') : doc.meta.status === 'paid' ? t(lang, 'statusPaidHint') : t(lang, 'statusUnpaidHint')}
        </span>
      </div>
    </div>
  );
}
