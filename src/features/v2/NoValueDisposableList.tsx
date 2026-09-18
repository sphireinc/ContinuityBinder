import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectField, TextArea, TextField } from '../../components/forms';
import { createEncryptedRepository, type ContinuityDatabase } from '../../data/repositories/encryptedRepository';
import { personSchema } from '../household/HouseholdSetup';

const base = { id: z.string(), schemaVersion: z.number(), createdAt: z.string(), updatedAt: z.string() };
export const noValueDisposableSchema = z.object({
  ...base,
  itemCategory: z.string(),
  location: z.string(),
  reason: z.string(),
  anyException: z.string(),
  whoShouldVerifyId: z.string(),
  supportingDocumentLocation: z.string(),
  primaryContact: z.string(),
  preparerNotes: z.string(),
  notes: z.string(),
  printPolicy: z.enum(['full', 'last4', 'hidden']),
  includeInPrint: z.boolean(),
  includeInReadableExport: z.boolean(),
});
type RecordType = z.infer<typeof noValueDisposableSchema>;
type Person = z.infer<typeof personSchema>;
type FormState = Omit<RecordType, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>;

const empty: FormState = {
  itemCategory: '', location: '', reason: '', anyException: '', whoShouldVerifyId: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
};

export function NoValueDisposableList({ database, dek }: { database: ContinuityDatabase | null; dek: CryptoKey }) {
  const { t } = useTranslation('v2', { keyPrefix: 'these_things_have_no_value_list' });
  const [records, setRecords] = useState<RecordType[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(database, dek, 'NoValueDisposableRecord', noValueDisposableSchema).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
    ]).then(([nextRecords, nextPeople]) => { setRecords(nextRecords); setPeople(nextPeople); });
  };
  useEffect(load, [database, dek]);
  const name = (id: string) => {
    const person = people.find((item) => item.id === id);
    return person ? `${person.legalFirstName} ${person.legalLastName}` : t('unknown');
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !form.itemCategory.trim() || !form.location.trim() || !form.reason.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(database, dek, 'NoValueDisposableRecord', noValueDisposableSchema).put({ id: crypto.randomUUID(), schemaVersion: 1, createdAt: now, updatedAt: now, ...form, itemCategory: form.itemCategory.trim(), location: form.location.trim(), reason: form.reason.trim() });
    setForm(empty); setSaved(true); load();
  };
  const personOptions = [{ value: '', label: t('unknown') }, ...people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))];
  return <section className="section-page v2-feature"><p className="eyebrow">{t('title')}</p><h2>{t('title')}</h2><p>{t('intro')}</p><p className="security-clarification">{t('caution')}</p><div className="section-card"><h3>{t('summary')}</h3>{records.length === 0 ? <p>{t('empty')}</p> : <ul>{records.map((record) => <li key={record.id}>{record.itemCategory} — {record.location} — {name(record.whoShouldVerifyId)}</li>)}</ul>}</div><div className="section-card"><h3>{t('add')}</h3><form onSubmit={(event) => void save(event)}><div className="form-grid"><TextField label={t('itemCategory')} value={form.itemCategory} onChange={(event) => setForm({ ...form, itemCategory: event.target.value })} required /><TextField label={t('location')} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required /><TextArea label={t('reason')} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required /><TextArea label={t('anyException')} value={form.anyException} onChange={(event) => setForm({ ...form, anyException: event.target.value })} /><SelectField label={t('whoShouldVerify')} value={form.whoShouldVerifyId} onChange={(event) => setForm({ ...form, whoShouldVerifyId: event.target.value })} options={personOptions} /></div><TextArea label={t('supportingDocumentLocation')} value={form.supportingDocumentLocation} onChange={(event) => setForm({ ...form, supportingDocumentLocation: event.target.value })} /><TextField label={t('primaryContact')} value={form.primaryContact} onChange={(event) => setForm({ ...form, primaryContact: event.target.value })} /><TextArea label={t('preparerNotes')} value={form.preparerNotes} onChange={(event) => setForm({ ...form, preparerNotes: event.target.value })} /><TextArea label={t('notes')} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /><SelectField label={t('printPolicy')} value={form.printPolicy} onChange={(event) => setForm({ ...form, printPolicy: event.target.value as RecordType['printPolicy'] })} options={(['full', 'last4', 'hidden'] as const).map((value) => ({ value, label: t(value) }))} /><label><input type="checkbox" checked={form.includeInPrint} onChange={(event) => setForm({ ...form, includeInPrint: event.target.checked })} /> {t('includeInPrint')}</label><label><input type="checkbox" checked={form.includeInReadableExport} onChange={(event) => setForm({ ...form, includeInReadableExport: event.target.checked })} /> {t('includeInReadableExport')}</label><button className="button button-primary">{t('save')}</button>{saved && <p role="status">{t('saved')}</p>}</form></div><div className="section-card paper-actions"><h3>{t('paperActions')}</h3><p className="security-clarification"><strong>{t('warning')}</strong></p><p>☐ {t('reviewed')}  ☐ {t('disposedDonated')}</p><p>{t('date')}: ____ / ____ / ______  {t('initials')}: __________  {t('reference')}: ____________________</p><div className="handwriting-lines" aria-hidden="true" /></div></section>;
}
