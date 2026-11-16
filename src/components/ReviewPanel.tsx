import { invoiceChecks } from '../lib/model';
import { t } from '../i18n';
import { Icon } from './Icons';
import type { InvoiceDoc } from '../types';

export function ReviewPanel({ doc }: { doc: InvoiceDoc }) {
  const lang = doc.settings.lang;
  const { checks, passed, score } = invoiceChecks(doc);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <section className="card panel review-panel">
      <header className="panel__head">
        <div>
          <h3>{t(lang, 'reviewTitle')}</h3>
          <p>{t(lang, 'reviewHint')}</p>
        </div>
        <span className="score-chip">{t(lang, 'checksPassed', { done: passed, total: checks.length })}</span>
      </header>
      <div className="review-body">
        <div className="score-ring" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={radius} className="score-ring__track" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="score-ring__value"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="score-ring__label">
            <strong>{score}</strong>
            <span>{t(lang, 'scoreLabel')}</span>
          </div>
        </div>
        <ul className="checks">
          {checks.map((check) => (
            <li key={check.label} className={check.ok ? 'is-ok' : ''}>
              <span className="checks__mark"><Icon name={check.ok ? 'check' : 'x'} size={12} /></span>
              {t(lang, check.label)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
