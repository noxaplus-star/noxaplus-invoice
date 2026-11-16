import { Field } from '../components/Fields';
import { t } from '../i18n';
import type { Lang, Party } from '../types';

interface Props {
  party: Party;
  lang: Lang;
  patch: (value: Partial<Party>) => void;
}

export function PartyFields({ party, lang, patch }: Props) {
  return (
    <div className="field-grid">
      <Field label={t(lang, 'companyName')} value={party.name} onChange={(name) => patch({ name })} className="span-2" autoComplete="organization" />
      <Field label={t(lang, 'contactPerson')} value={party.contact} onChange={(contact) => patch({ contact })} autoComplete="name" />
      <Field label={t(lang, 'phone')} value={party.phone} onChange={(phone) => patch({ phone })} type="tel" ltr autoComplete="tel" />
      <Field label={t(lang, 'email')} value={party.email} onChange={(email) => patch({ email })} type="email" ltr autoComplete="email" />
      <Field label={t(lang, 'nationalId')} value={party.nationalId} onChange={(nationalId) => patch({ nationalId })} ltr />
      <Field label={t(lang, 'city')} value={party.city} onChange={(city) => patch({ city })} />
      <Field label={t(lang, 'postalCode')} value={party.postalCode} onChange={(postalCode) => patch({ postalCode })} ltr />
      <Field label={t(lang, 'address')} value={party.address} onChange={(address) => patch({ address })} className="span-2" autoComplete="street-address" />
    </div>
  );
}
