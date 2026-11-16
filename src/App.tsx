import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import markDark from './assets/mark-dark.png';
import markLight from './assets/mark-light.png';
import { InvoiceSheet } from './components/InvoiceSheet';
import { ItemsEditor } from './components/ItemsEditor';
import { PaymentEditor } from './components/PaymentEditor';
import { PartyFields } from './components/PartyFields';
import { ReviewPanel } from './components/ReviewPanel';
import { Field, IconButton, TextArea, Toggle } from './components/Fields';
import { Icon } from './components/Icons';
import { makeSample, createEmptyInvoice, matchesSample, nextInvoiceNumber, normalizeDoc, touch, updateSettings, buyerRecord, invoiceTotals } from './lib/model';
import { readBuyers, readStoredDoc, writeBuyers, writeSellerProfile, writeStoredDoc } from './lib/storage';
import { buildShareUrl, readShareHash } from './lib/share';
import { copyText, downloadText } from './lib/download';
import { photoToDataUrl } from './lib/photo';
import { addDaysISO, formatMoney, parseAmount, todayISO } from './lib/money';
import { currencyLabel, formatNumber, STATUS_LABEL, t } from './i18n';
import type {
  Accent,
  BuyerRecord,
  ChequeDetails,
  Currency,
  Density,
  InstallmentPlan,
  InvoiceDoc,
  InvoiceItem,
  InvoiceStatus,
  Lang,
  Party,
  PaymentMethod,
  Settings,
  Template,
} from './types';

const ACCENTS: Accent[] = ['indigo', 'teal', 'plum', 'clay'];
const TEMPLATES: Template[] = ['classic', 'modern', 'minimal'];
const CURRENCIES: Currency[] = ['IRT', 'IRR', 'USD', 'EUR', 'AED'];
const STATUSES: InvoiceStatus[] = ['draft', 'unpaid', 'paid'];
const TEMPLATE_HINT = { classic: 'templateClassicHint', modern: 'templateModernHint', minimal: 'templateMinimalHint' } as const;

function initialDoc(): InvoiceDoc {
  return readStoredDoc() ?? makeSample('fa');
}

export default function App() {
  const [doc, setDoc] = useState<InvoiceDoc>(initialDoc);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [toast, setToast] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [fitScale, setFitScale] = useState(0.72);
  const [sheetHeight, setSheetHeight] = useState(1123);
  const [buyers, setBuyers] = useState<BuyerRecord[]>(readBuyers);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareStripped, setShareStripped] = useState(false);
  const [copied, setCopied] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const { settings, meta, seller, buyer } = doc;
  const lang = settings.lang;
  const theme = settings.theme;
  const currency = currencyLabel(meta.currency, lang);
  const totals = invoiceTotals(doc);
  const pages = Math.max(1, Math.ceil((sheetHeight - 6) / 1123));
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const sample = matchesSample(doc);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'fa' ? 'rtl' : 'ltr';
    root.dataset.theme = theme;
    root.dataset.accent = settings.accent;
    document.title = `${meta.number} · NoxaPlus Invoice Desk`;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#10151b' : '#f4f1ea');
  }, [lang, theme, settings.accent, meta.number]);

  useEffect(() => {
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      writeStoredDoc(doc);
      if (!matchesSample(doc) && doc.seller.name.trim()) {
        writeSellerProfile({ party: doc.seller, logo: doc.logo, signature: doc.signature });
      }
      setSaveState('saved');
    }, 420);
    return () => window.clearTimeout(timer);
  }, [doc]);

  useEffect(() => {
    let active = true;
    void readShareHash(window.location.hash).then((shared) => {
      if (!active || !shared) return;
      setDoc(shared);
      notify(t(shared.settings.lang, 'imported'));
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const width = stage.clientWidth - 40;
      if (width <= 0) return;
      setFitScale(Math.min(1, Math.max(0.34, width / 794)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const zoom = Number.parseFloat(frame.style.zoom) || 1;
      setSheetHeight(frame.getBoundingClientRect().height / zoom);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [doc]);

  useEffect(() => {
    if (!shareOpen) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShareOpen(false);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [shareOpen]);

  const closeMenu = () => menuRef.current?.removeAttribute('open');
  const setSettings = (patch: Partial<Settings>) => setDoc((prev) => updateSettings(prev, patch));
  const patchSeller = (value: Partial<Party>) => setDoc((prev) => touch({ ...prev, seller: { ...prev.seller, ...value } }));
  const patchBuyer = (value: Partial<Party>) => setDoc((prev) => touch({ ...prev, buyer: { ...prev.buyer, ...value } }));
  const patchMeta = (value: Partial<InvoiceDoc['meta']>) => setDoc((prev) => touch({ ...prev, meta: { ...prev.meta, ...value } }));

  const patchItem = (id: string, value: Partial<InvoiceItem>) => setDoc((prev) => touch({
    ...prev,
    items: prev.items.map((item) => (item.id === id ? { ...item, ...value } : item)),
  }));

  const addItem = () => setDoc((prev) => touch({ ...prev, items: [...prev.items, { id: `it_${Math.random().toString(36).slice(2, 9)}`, title: '', description: '', qty: 1, unitPrice: 0, discount: 0 }] }));

  const removeItem = (id: string) => setDoc((prev) => touch({ ...prev, items: prev.items.filter((item) => item.id !== id) }));

  const moveItem = (id: string, direction: -1 | 1) => setDoc((prev) => {
    const index = prev.items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= prev.items.length) return prev;
    const items = [...prev.items];
    [items[index], items[target]] = [items[target], items[index]];
    return touch({ ...prev, items });
  });

  const setMethod = (method: PaymentMethod) => setDoc((prev) => touch({
    ...prev,
    payment: { ...prev.payment, method },
  }));

  const setCash = (cashPaid: number) => setDoc((prev) => touch({ ...prev, payment: { ...prev.payment, cashPaid } }));
  const setCheque = (value: Partial<ChequeDetails>) => setDoc((prev) => touch({ ...prev, payment: { ...prev.payment, cheque: { ...prev.payment.cheque, ...value } } }));
  const setInstallment = (value: Partial<InstallmentPlan>) => setDoc((prev) => touch({ ...prev, payment: { ...prev.payment, installment: { ...prev.payment.installment, ...value } } }));

  const onImage = async (event: ChangeEvent<HTMLInputElement>, target: 'logo' | 'signature') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await photoToDataUrl(file);
      setDoc((prev) => touch({ ...prev, [target]: dataUrl }));
    } catch {
      notify(t(lang, 'imageError'));
    }
  };

  const switchLang = (next: Lang) => {
    setDoc((prev) => {
      const nextSettings = { ...prev.settings, lang: next };
      if (matchesSample(prev)) {
        const translated = makeSample(next, nextSettings);
        return { ...translated, settings: nextSettings, logo: prev.logo, signature: prev.signature };
      }
      return touch({ ...prev, settings: nextSettings });
    });
  };

  const saveBuyer = () => {
    if (!doc.buyer.name.trim()) return;
    setBuyers((prev) => {
      const record = buyerRecord(doc.buyer);
      const existing = prev.find((item) => item.party.name.trim() === record.name && item.party.phone.trim() === doc.buyer.phone.trim());
      const next = existing
        ? prev.map((item) => (item.id === existing.id ? { ...item, party: record.party, name: record.name, savedAt: record.savedAt } : item))
        : [record, ...prev].slice(0, 12);
      writeBuyers(next);
      return next;
    });
    notify(t(lang, 'buyerSaved'));
  };

  const applyBuyer = (record: BuyerRecord) => setDoc((prev) => touch({ ...prev, buyer: { ...record.party } }));

  const deleteBuyer = (id: string) => {
    setBuyers((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeBuyers(next);
      return next;
    });
    notify(t(lang, 'buyerDeleted'));
  };

  const exportJson = () => downloadText(JSON.stringify(doc, null, 2), `${meta.number || 'invoice'}.json`);

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = normalizeDoc(JSON.parse(await file.text()));
      if (!imported) {
        notify(t(lang, 'jsonError'));
        return;
      }
      setDoc(imported);
      notify(t(lang, 'jsonImported'));
    } catch {
      notify(t(lang, 'jsonError'));
    }
  };

  const loadSample = () => {
    closeMenu();
    if (!matchesSample(doc) && (buyer.name.trim() || doc.items.some((item) => item.title.trim())) && !window.confirm(t(lang, 'confirmReplace'))) return;
    const settingsPatch = { theme, accent: settings.accent, template: settings.template, density: settings.density, showPromo: settings.showPromo, zoom: settings.zoom };
    setDoc(makeSample(lang, settingsPatch));
    notify(t(lang, 'sampleLoaded'));
  };

  const startBlank = () => {
    closeMenu();
    if (!window.confirm(t(lang, 'confirmBlank'))) return;
    const blank = createEmptyInvoice(lang, doc.seller, doc.logo);
    setDoc({ ...blank, signature: doc.signature, settings: { ...doc.settings } });
    notify(t(lang, 'blankStarted'));
  };

  const duplicate = () => {
    closeMenu();
    setDoc((prev) => touch({
      ...prev,
      meta: { ...prev.meta, number: nextInvoiceNumber(), issueDate: todayISO(), dueDate: addDaysISO(todayISO(), 14), status: 'draft' },
      payment: { ...prev.payment, cashPaid: 0 },
    }));
    notify(t(lang, 'duplicated'));
  };

  const openShare = async () => {
    const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const result = await buildShareUrl(doc, base);
    setShareUrl(result.url);
    setShareStripped(result.stripped);
    setCopied(false);
    setShareOpen(true);
  };

  const copyShare = async () => {
    if (await copyText(shareUrl)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const nativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title: `${t(lang, 'invoiceShort')} ${meta.number}`, text: t(lang, 'shareTitle'), url: shareUrl });
    } catch {
      // The user dismissed the sheet.
    }
  };

  const scale = settings.zoom === 'actual' ? 1 : fitScale;

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="./" aria-label="NoxaPlus">
          <span className="brand__logo">
            <img className="brand-logo-light" src={markLight} alt="" />
            <img className="brand-logo-dark" src={markDark} alt="" />
          </span>
          <span className="brand__text"><strong>NoxaPlus</strong><span>{t(lang, 'brandProduct')}</span></span>
        </a>
        <div className="topbar__actions">
          <span className={`save-state save-state--${saveState}`}>
            <span className="save-state__dot" />
            {t(lang, 'autosave')}
          </span>
          <details className="menu" ref={menuRef}>
            <summary className="icon-btn" aria-label={t(lang, 'menu')} title={t(lang, 'menu')}>
              <Icon name="menu" size={18} />
            </summary>
            <div className="menu__panel">
              <button type="button" onClick={loadSample}><Icon name="sparkles" size={16} />{t(lang, 'loadSample')}</button>
              <button type="button" onClick={duplicate}><Icon name="copy" size={16} />{t(lang, 'duplicate')}</button>
              <button type="button" onClick={startBlank}><Icon name="plus" size={16} />{t(lang, 'startBlank')}</button>
              <span className="menu__sep" />
              <button type="button" onClick={() => { closeMenu(); exportJson(); }}><Icon name="download" size={16} />{t(lang, 'exportJson')}</button>
              <button type="button" onClick={() => { closeMenu(); importRef.current?.click(); }}><Icon name="upload" size={16} />{t(lang, 'importJson')}</button>
              <span className="menu__sep" />
              <a href="https://www.noxaplus.ir" target="_blank" rel="noreferrer"><Icon name="external" size={16} />{t(lang, 'site')}</a>
              <a href="https://github.com/noxaplus-star/noxaplus-invoice" target="_blank" rel="noreferrer"><Icon name="github" size={16} />{t(lang, 'github')}</a>
            </div>
          </details>
          <div className="lang-switch" role="group" aria-label="Language">
            <button type="button" className={lang === 'fa' ? 'is-active' : ''} aria-pressed={lang === 'fa'} onClick={() => switchLang('fa')}>FA</button>
            <button type="button" className={lang === 'en' ? 'is-active' : ''} aria-pressed={lang === 'en'} onClick={() => switchLang('en')}>EN</button>
          </div>
          <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? t(lang, 'lightMode') : t(lang, 'darkMode')} onClick={() => setSettings({ theme: theme === 'dark' ? 'light' : 'dark' })} />
          <button type="button" className="btn btn--soft topbar__share" onClick={() => void openShare()}>
            <Icon name="share" size={16} />
            <span>{t(lang, 'share')}</span>
          </button>
          <button type="button" className="btn btn--primary topbar__print" onClick={() => window.print()}>
            <Icon name="printer" size={17} />
            <span>{t(lang, 'printPdf')}</span>
          </button>
        </div>
      </header>

      <main className="page__body">
        <section className="hero">
          <div className="hero__copy">
            <p className="hero__eyebrow"><Icon name="sparkles" size={14} />NOXAPLUS INVOICE DESK</p>
            <h1 className="hero__title">{t(lang, 'heroTitle')}</h1>
            <p className="hero__lead">{t(lang, 'heroCopy')}</p>
          </div>
          <div className="hero__steps" aria-hidden="true">
            <span><b>01</b>{t(lang, 'stepSeller')}</span>
            <span><b>02</b>{t(lang, 'stepItems')}</span>
            <span><b>03</b>{t(lang, 'stepSign')}</span>
          </div>
        </section>

        {sample ? (
          <div className="sample-note">
            <p><Icon name="sparkles" size={14} />{t(lang, 'sampleNote')}</p>
            <button type="button" onClick={startBlank}>{t(lang, 'startBlank')}</button>
          </div>
        ) : null}

        <div className="workspace" data-mobile-view={mobileView}>
          <aside className="editor">
            <section className="card editor-card">
              <header className="editor-card__head">
                <div className="editor-card__heading"><h3>{t(lang, 'sellerTitle')}</h3><span className="count-badge">1</span></div>
                <span className="editor-card__note">{t(lang, 'sellerProfileSaved')}</span>
              </header>
              <div className="editor-card__body">
                <div className="brand-assets">
                  <div className="brand-assets__box">
                    <div className="logo-preview">
                      {doc.logo ? <img src={doc.logo} alt="" /> : <span><Icon name="receipt" size={25} /></span>}
                    </div>
                    <div className="brand-assets__actions">
                      <button type="button" className="btn btn--soft btn--sm" onClick={() => logoRef.current?.click()}>
                        <Icon name="image" size={15} />{t(lang, 'chooseLogo')}
                      </button>
                      {doc.logo ? <IconButton icon="trash" label={t(lang, 'removeLogo')} size={15} tone="danger" onClick={() => setDoc((prev) => touch({ ...prev, logo: null }))} /> : null}
                      <p>{t(lang, 'logoHint')}</p>
                    </div>
                  </div>
                  <div className="brand-assets__box">
                    <div className="signature-preview">
                      {doc.signature ? <img src={doc.signature} alt="" /> : <span><Icon name="pen" size={20} /></span>}
                    </div>
                    <div className="brand-assets__actions">
                      <button type="button" className="btn btn--soft btn--sm" onClick={() => signatureRef.current?.click()}>
                        <Icon name="pen" size={15} />{t(lang, 'chooseSignature')}
                      </button>
                      {doc.signature ? <IconButton icon="trash" label={t(lang, 'removeSignature')} size={15} tone="danger" onClick={() => setDoc((prev) => touch({ ...prev, signature: null }))} /> : null}
                      <p>{t(lang, 'signatureHint')}</p>
                    </div>
                  </div>
                </div>
                <PartyFields party={seller} lang={lang} patch={patchSeller} />
              </div>
            </section>

            <section className="card editor-card">
              <header className="editor-card__head">
                <div className="editor-card__heading"><h3>{t(lang, 'buyerTitle')}</h3><span className="count-badge">2</span></div>
                <button type="button" className="btn btn--ghost btn--sm" onClick={saveBuyer} disabled={!buyer.name.trim()}>
                  <Icon name="book" size={15} />{t(lang, 'saveBuyer')}
                </button>
              </header>
              <div className="editor-card__body">
                <div className="buyer-book">
                  <p className="buyer-book__title"><Icon name="users" size={14} />{t(lang, 'savedBuyers')}</p>
                  {buyers.length ? (
                    <div className="buyer-chips">
                      {buyers.map((record) => (
                        <span className="buyer-chip" key={record.id}>
                          <button type="button" onClick={() => applyBuyer(record)} title={t(lang, 'applyBuyer')}>{record.name}</button>
                          <button type="button" className="buyer-chip__x" aria-label={t(lang, 'deleteBuyer')} onClick={() => deleteBuyer(record.id)}><Icon name="x" size={11} /></button>
                        </span>
                      ))}
                    </div>
                  ) : <p className="buyer-book__empty">{t(lang, 'noSavedBuyers')}</p>}
                </div>
                <PartyFields party={buyer} lang={lang} patch={patchBuyer} />
              </div>
            </section>

            <section className="card editor-card">
              <header className="editor-card__head">
                <div className="editor-card__heading"><h3>{t(lang, 'invoiceTitle')}</h3><span className="count-badge">3</span></div>
              </header>
              <div className="editor-card__body">
                <div className="field-grid">
                  <div className="field span-2">
                    <label className="field__label" htmlFor="invoice-number">{t(lang, 'invoiceNumber')}<span className="field__hint">{t(lang, 'generated')}</span></label>
                    <div className="inline-field">
                      <input id="invoice-number" className="field__input field__input--ltr" value={meta.number} onChange={(event) => patchMeta({ number: event.target.value })} />
                      <IconButton icon="refresh" label={t(lang, 'regenerate')} onClick={() => patchMeta({ number: nextInvoiceNumber() })} />
                    </div>
                  </div>
                  <Field label={t(lang, 'issueDate')} value={meta.issueDate} type="date" onChange={(issueDate) => patchMeta({ issueDate })} />
                  <Field label={t(lang, 'dueDate')} value={meta.dueDate} type="date" onChange={(dueDate) => patchMeta({ dueDate })} />
                </div>
                <div className="meta-row">
                  <div className="status-switch" role="group" aria-label={t(lang, 'status')}>
                    {STATUSES.map((status) => (
                      <button key={status} type="button" className={`status-pill status-pill--${status}${meta.status === status ? ' is-active' : ''}`} onClick={() => patchMeta({ status })}>
                        {t(lang, STATUS_LABEL[status])}
                      </button>
                    ))}
                  </div>
                  <label className="field field--inline">
                    <span className="field__label">{t(lang, 'currency')}</span>
                    <select className="field__input" value={meta.currency} onChange={(event) => patchMeta({ currency: event.target.value as Currency })}>
                      {CURRENCIES.map((item) => <option key={item} value={item}>{currencyLabel(item, lang)}</option>)}
                    </select>
                  </label>
                </div>
                <p className="status-hint">
                  {meta.status === 'draft' ? t(lang, 'statusDraftHint') : meta.status === 'paid' ? t(lang, 'statusPaidHint') : t(lang, 'statusUnpaidHint')}
                </p>
              </div>
            </section>

            <section className="card editor-card">
              <header className="editor-card__head">
                <div className="editor-card__heading"><h3>{t(lang, 'itemsTitle')}</h3><span className="count-badge">{doc.items.length}</span></div>
                <span className="editor-card__note">{currency}</span>
              </header>
              <div className="editor-card__body">
                <ItemsEditor doc={doc} patch={patchItem} add={addItem} remove={removeItem} move={moveItem} />
              </div>
            </section>

            <section className="card editor-card">
              <header className="editor-card__head">
                <div className="editor-card__heading"><h3>{t(lang, 'adjustmentsTitle')}</h3></div>
              </header>
              <div className="editor-card__body">
                <div className="field-grid">
                  <Field label={t(lang, 'invoiceDiscount')} value={String(doc.discount)} type="number" ltr onChange={(value) => setDoc((prev) => touch({ ...prev, discount: parseAmount(value) }))} />
                  <Field label={t(lang, 'taxRate')} value={String(doc.taxRate)} type="number" onChange={(value) => setDoc((prev) => touch({ ...prev, taxRate: Math.min(100, Math.max(0, Math.round(Number(value) || 0))) }))} />
                  <Field label={t(lang, 'shipping')} value={String(doc.shipping)} type="number" ltr onChange={(value) => setDoc((prev) => touch({ ...prev, shipping: parseAmount(value) }))} />
                  <Field label={t(lang, 'previousBalance')} value={String(doc.previousBalance)} type="number" ltr onChange={(value) => setDoc((prev) => touch({ ...prev, previousBalance: parseAmount(value) }))} />
                </div>
                <div className="totals-strip">
                  <div><span>{t(lang, 'subtotal')}</span><strong>{formatMoney(totals.subtotal, meta.currency, lang)}</strong></div>
                  <div><span>{t(lang, 'tax')}</span><strong>{formatMoney(totals.tax, meta.currency, lang)}</strong></div>
                  <div><span>{t(lang, 'total')}</span><strong>{formatMoney(totals.total, meta.currency, lang)}</strong></div>
                  <div><span>{t(lang, 'balance')}</span><strong>{formatMoney(totals.balance, meta.currency, lang)}</strong></div>
                </div>
              </div>
            </section>

            <section className="card editor-card">
              <header className="editor-card__head">
                <div className="editor-card__heading"><h3>{t(lang, 'paymentTitle')}</h3><span className="count-badge">4</span></div>
              </header>
              <div className="editor-card__body">
                <PaymentEditor doc={doc} method={setMethod} cash={setCash} installment={setInstallment} cheque={setCheque} />
              </div>
            </section>

            <section className="card editor-card">
              <header className="editor-card__head">
                <div className="editor-card__heading"><h3>{t(lang, 'notesTitle')}</h3></div>
              </header>
              <div className="editor-card__body">
                <TextArea label={t(lang, 'notes')} value={doc.notes} onChange={(notes) => setDoc((prev) => touch({ ...prev, notes }))} rows={3} />
                <TextArea label={t(lang, 'terms')} value={doc.terms} onChange={(terms) => setDoc((prev) => touch({ ...prev, terms }))} rows={3} />
              </div>
            </section>

            <ReviewPanel doc={doc} />
          </aside>

          <aside className="preview-pane">
            <div className="card designbar">
              <div className="designbar__row">
                <div className="templates" role="group" aria-label="Template">
                  {TEMPLATES.map((template) => (
                    <button key={template} type="button" className={`template-btn${settings.template === template ? ' is-active' : ''}`} onClick={() => setSettings({ template })} title={t(lang, TEMPLATE_HINT[template])}>
                      {t(lang, template)}
                    </button>
                  ))}
                </div>
                <div className="zoom-switch" role="group" aria-label="Zoom">
                  <button type="button" className={settings.zoom === 'fit' ? 'is-active' : ''} onClick={() => setSettings({ zoom: 'fit' })}>{t(lang, 'zoomFit')}</button>
                  <button type="button" className={settings.zoom === 'actual' ? 'is-active' : ''} onClick={() => setSettings({ zoom: 'actual' })}>{t(lang, 'zoomActual')}</button>
                </div>
              </div>
              <div className="designbar__row">
                <div className="accent-dots" role="group" aria-label="Accent">
                  {ACCENTS.map((accent) => (
                    <button key={accent} type="button" className={`accent-dot accent-dot--${accent}${settings.accent === accent ? ' is-active' : ''}`} aria-label={t(lang, accent)} title={t(lang, accent)} onClick={() => setSettings({ accent })} />
                  ))}
                </div>
                <div className="density-switch" role="group" aria-label="Density">
                  {(['cozy', 'compact'] as Density[]).map((density) => (
                    <button key={density} type="button" className={settings.density === density ? 'is-active' : ''} onClick={() => setSettings({ density })}>{t(lang, density)}</button>
                  ))}
                </div>
                <div className="promo-switch">
                  <Toggle checked={settings.showPromo} onChange={(showPromo) => setSettings({ showPromo })} label={t(lang, 'promo')} />
                  <span title={t(lang, 'promoHint')}>{t(lang, 'promo')}</span>
                </div>
              </div>
            </div>

            <div className="card stage" ref={stageRef}>
              <div className="stage__bar">
                <span className="stage__title"><Icon name="receipt" size={14} />{t(lang, 'previewTitle')}</span>
                <span className="stage__page">{t(lang, 'pageLabel')} · {pages === 1 ? t(lang, 'pageOne') : t(lang, 'pageMany', { n: formatNumber(pages, lang) })}</span>
              </div>
              <div className="stage__scroll">
                <div className="sheet-frame" ref={frameRef} style={{ zoom: scale }}>
                  <InvoiceSheet doc={doc} />
                </div>
              </div>
            </div>

            <div className="preview-actions">
              <button type="button" className="btn btn--primary" onClick={() => window.print()}>
                <Icon name="printer" size={17} />
                {t(lang, 'printPdf')}
              </button>
              <button type="button" className="btn btn--soft" onClick={() => void openShare()}>
                <Icon name="share" size={17} />
                {t(lang, 'share')}
              </button>
            </div>

            <section className="promo-card">
              <span className="promo-card__logo">
                <img className="brand-logo-dark" src={markDark} alt="" />
                <img className="brand-logo-light" src={markLight} alt="" />
              </span>
              <div>
                <strong>{t(lang, 'promoFooter')}</strong>
                <a href="https://www.noxaplus.ir" target="_blank" rel="noreferrer">noxaplus.ir <Icon name="external" size={12} /></a>
              </div>
            </section>

            <p className="print-hint-foot"><Icon name="printer" size={13} />{t(lang, 'printHint')}</p>
          </aside>
        </div>
      </main>

      <nav className="mobile-tabs" aria-label="View">
        <button type="button" className={mobileView === 'edit' ? 'is-active' : ''} onClick={() => setMobileView('edit')}><Icon name="pen" size={17} />{t(lang, 'editTab')}</button>
        <button type="button" className={mobileView === 'preview' ? 'is-active' : ''} onClick={() => setMobileView('preview')}><Icon name="eye" size={17} />{t(lang, 'previewTab')}</button>
      </nav>

      {shareOpen ? (
        <div className="modal" role="presentation" onClick={() => setShareOpen(false)}>
          <div className="modal__card" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(event) => event.stopPropagation()}>
            <header className="modal__head">
              <div><h2 id="share-title">{t(lang, 'shareTitle')}</h2><p>{t(lang, 'shareHint')}</p></div>
              <IconButton icon="x" label={t(lang, 'close')} onClick={() => setShareOpen(false)} />
            </header>
            <input className="share-link" readOnly value={shareUrl} dir="ltr" onFocus={(event) => event.currentTarget.select()} />
            {shareStripped ? <p className="modal__warn"><Icon name="alert" size={14} />{t(lang, 'shareWarn')}</p> : null}
            <div className="modal__actions">
              <button type="button" className="btn btn--primary" onClick={() => void copyShare()}>
                <Icon name="copy" size={16} />{copied ? t(lang, 'shareCopied') : t(lang, 'copyLink')}
              </button>
              {canNativeShare ? <button type="button" className="btn btn--soft" onClick={() => void nativeShare()}><Icon name="share" size={16} />{t(lang, 'shareNative')}</button> : null}
              <button type="button" className="btn btn--ghost" onClick={exportJson}><Icon name="download" size={16} />{t(lang, 'shareDownload')}</button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="toast" role="status">{toast}</div> : null}

      <input ref={logoRef} type="file" accept="image/*" hidden onChange={(event) => void onImage(event, 'logo')} />
      <input ref={signatureRef} type="file" accept="image/*" hidden onChange={(event) => void onImage(event, 'signature')} />
      <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(event) => void importJson(event)} />
    </div>
  );
}

