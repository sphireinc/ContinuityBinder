import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectField, TextArea, TextField } from '../../components/forms';
import { createEncryptedRepository, type ContinuityDatabase } from '../../data/repositories/encryptedRepository';
import { personSchema } from '../household/HouseholdSetup';

const base = { id: z.string(), schemaVersion: z.number(), createdAt: z.string(), updatedAt: z.string() };
export const collectionSchema = z.object({
  ...base,
  collectionName: z.string(),
  category: z.string(),
  ownerId: z.string(),
  location: z.string(),
  approximateSizeValue: z.string(),
  catalogLocation: z.string(),
  knowledgeableContactId: z.string(),
  insurance: z.string(),
  preferredDispositionNote: z.string(),
  supportingDocumentLocation: z.string(),
  primaryContact: z.string(),
  preparerNotes: z.string(),
  notes: z.string(),
  printPolicy: z.enum(['full', 'last4', 'hidden']),
  includeInPrint: z.boolean(),
  includeInReadableExport: z.boolean(),
});
type RecordType = z.infer<typeof collectionSchema>;
type Person = z.infer<typeof personSchema>;
type FormState = Omit<RecordType, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>;

const empty: FormState = {
  collectionName: '', category: '', ownerId: '', location: '', approximateSizeValue: '', catalogLocation: '', knowledgeableContactId: '', insurance: '', preferredDispositionNote: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
};

export function CollectionsInventory({ database, dek }: { database: ContinuityDatabase | null; dek: CryptoKey }) {
  const { t } = useTranslation('v2', { keyPrefix: 'collections_inventory' });
  const [records, setRecords] = useState<RecordType[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(database, dek, 'CollectionRecord', collectionSchema).list(),
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
    if (!database || !form.collectionName.trim() || !form.category.trim() || !form.location.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(database, dek, 'CollectionRecord', collectionSchema).put({ id: crypto.randomUUID(), schemaVersion: 1, createdAt: now, updatedAt: now, ...form, collectionName: form.collectionName.trim(), category: form.category.trim(), location: form.location.trim() });
    setForm(empty); setSaved(true); load();
  };
  return <section className="section-page v2-feature"><p className="eyebrow">{t('title')}</p><h2>{t('title')}</h2><p>{t('intro')}</p><p className="security-clarification">{t('caution')}</p><div className="section-card"><h3>{t('summary')}</h3>{records.length === 0 ? <p>{t('empty')}</p> : <ul>{records.map((record) => <li key={record.id}>{record.collectionName} — {record.category} — {name(record.ownerId)}</li>)}</ul>}</div><div className="section-card"><h3>{t('add')}</h3><form onSubmit={(event) => void save(event)}><div className="form-grid"><TextField label={t('collectionName')} value={form.collectionName} onChange={(event) => setForm({ ...form, collectionName: event.target.value })} required /><TextField label={t('category')} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /><SelectField label={t('owner')} value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })} options={[{ value: '', label: t('unknown') }, ...people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))]} /><TextArea label={t('location')} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required /><TextField label={t('approximateSizeValue')} value={form.approximateSizeValue} onChange={(event) => setForm({ ...form, approximateSizeValue: event.target.value })} /><TextField label={t('catalogLocation')} value={form.catalogLocation} onChange={(event) => setForm({ ...form, catalogLocation: event.target.value })} /><SelectField label={t('knowledgeableContact')} value={form.knowledgeableContactId} onChange={(event) => setForm({ ...form, knowledgeableContactId: event.target.value })} options={[{ value: '', label: t('unknown') }, ...people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))]} /><TextArea label={t('insurance')} value={form.insurance} onChange={(event) => setForm({ ...form, insurance: event.target.value })} /></div><TextArea label={t('preferredDispositionNote')} value={form.preferredDispositionNote} onChange={(event) => setForm({ ...form, preferredDispositionNote: event.target.value })} /><TextArea label={t('supportingDocumentLocation')} value={form.supportingDocumentLocation} onChange={(event) => setForm({ ...form, supportingDocumentLocation: event.target.value })} /><TextField label={t('primaryContact')} value={form.primaryContact} onChange={(event) => setForm({ ...form, primaryContact: event.target.value })} /><TextArea label={t('preparerNotes')} value={form.preparerNotes} onChange={(event) => setForm({ ...form, preparerNotes: event.target.value })} /><TextArea label={t('notes')} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /><SelectField label={t('printPolicy')} value={form.printPolicy} onChange={(event) => setForm({ ...form, printPolicy: event.target.value as RecordType['printPolicy'] })} options={(['full', 'last4', 'hidden'] as const).map((value) => ({ value, label: t(value) }))} /><label><input type="checkbox" checked={form.includeInPrint} onChange={(event) => setForm({ ...form, includeInPrint: event.target.checked })} /> {t('includeInPrint')}</label><label><input type="checkbox" checked={form.includeInReadableExport} onChange={(event) => setForm({ ...form, includeInReadableExport: event.target.checked })} /> {t('includeInReadableExport')}</label><button className="button button-primary">{t('save')}</button>{saved && <p role="status">{t('saved')}</p>}</form></div><div className="section-card paper-actions"><h3>{t('paperActions')}</h3><p>☐ {t('specialistContacted')}  ☐ {t('catalogLocated')}  ☐ {t('valuationObtained')}</p><p>{t('warning')}</p><p>{t('date')}: ____ / ____ / ______  {t('initials')}: __________  {t('reference')}: ____________________</p><div className="handwriting-lines" aria-hidden="true" /></div></section>;
}
