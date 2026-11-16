import { EmptyRow, Field, IconButton, TextArea } from './Fields';
import { Icon } from './Icons';
import { formatMoney, parseAmount } from '../lib/money';
import { itemNet } from '../lib/model';
import { t } from '../i18n';
import type { InvoiceDoc, InvoiceItem } from '../types';

interface Props {
  doc: InvoiceDoc;
  patch: (id: string, value: Partial<InvoiceItem>) => void;
  add: () => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
}

export function ItemsEditor({ doc, patch, add, remove, move }: Props) {
  const lang = doc.settings.lang;
  const currency = doc.meta.currency;
  return (
    <div className="items-editor">
      {doc.items.length === 0 ? <EmptyRow text={t(lang, 'itemsEmpty')} cta={t(lang, 'addItemFirst')} onAdd={add} /> : null}
      {doc.items.map((item, index) => (
        <article className="item-card" key={item.id}>
          <header className="item-card__head">
            <span className="item-card__index">{index + 1}</span>
            <span className="item-card__sum">{formatMoney(itemNet(item), currency, lang)}</span>
            <div className="item-card__tools">
              <IconButton icon="up" label={t(lang, 'moveUp')} size={14} disabled={index === 0} onClick={() => move(item.id, -1)} />
              <IconButton icon="down" label={t(lang, 'moveDown')} size={14} disabled={index === doc.items.length - 1} onClick={() => move(item.id, 1)} />
              <IconButton icon="trash" label={t(lang, 'removeItem')} size={15} tone="danger" onClick={() => remove(item.id)} />
            </div>
          </header>
          <Field label={t(lang, 'itemTitle')} value={item.title} onChange={(title) => patch(item.id, { title })} />
          <TextArea label={t(lang, 'itemDescription')} value={item.description} onChange={(description) => patch(item.id, { description })} rows={2} />
          <div className="field-grid field-grid--3">
            <Field label={t(lang, 'qty')} value={String(item.qty)} type="number" onChange={(value) => patch(item.id, { qty: Math.max(0, Math.round(Number(value) || 0)) })} />
            <Field label={t(lang, 'unitPrice')} value={String(item.unitPrice)} type="number" onChange={(value) => patch(item.id, { unitPrice: parseAmount(value) })} ltr />
            <Field label={t(lang, 'discountPercent')} value={String(item.discount)} type="number" onChange={(value) => patch(item.id, { discount: Math.min(100, Math.max(0, Math.round(Number(value) || 0))) })} />
          </div>
        </article>
      ))}
      <button type="button" className="btn btn--soft add-row" onClick={add}>
        <Icon name="plus" size={16} />
        {t(lang, 'addItem')}
      </button>
    </div>
  );
}
