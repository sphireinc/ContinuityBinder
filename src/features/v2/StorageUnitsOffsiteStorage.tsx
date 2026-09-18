import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectField, TextArea, TextField } from '../../components/forms';
import { createEncryptedRepository, type ContinuityDatabase } from '../../data/repositories/encryptedRepository';
import { personSchema } from '../household/HouseholdSetup';

const base = { id: z.string(), schemaVersion: z.number(), createdAt: z.string(), updatedAt: z.string() };
export const storageUnitSchema = z.object({
  ...base,
  facility: z.string(),
  address: z.string(),
  unitNumber: z.string(),
  unitNumberPolicy: z.enum(['full', 'last4', 'hidden']),
  accountHolderId: z.string(),
  monthlyCost: z.string(),
  paymentSource: z.string(),
  accessKeyLocation: z.string(),
  authorizedPersonIds: z.string(),
  contentsSummary: z.string(),
  insurance: z.string(),
  contact: z.string(),
  supportingDocumentLocation: z.string(),
  primaryContact: z.string(),
  preparerNotes: z.string(),
  notes: z.string(),
  printPolicy: z.enum(['full', 'last4', 'hidden']),
  includeInPrint: z.boolean(),
  includeInReadableExport: z.boolean(),
});
type RecordType = z.infer<typeof storageUnitSchema>;
type Person = z.infer<typeof personSchema>;
type FormState = Omit<RecordType, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>;

const empty: FormState = {
  facility: '', address: '', unitNumber: '', unitNumberPolicy: 'hidden', accountHolderId: '', monthlyCost: '', paymentSource: '', accessKeyLocation: '', authorizedPersonIds: '', contentsSummary: '', insurance: '', contact: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
};

export function StorageUnitsOffsiteStorage({ database, dek }: { database: ContinuityDatabase | null; dek: CryptoKey }) {
  const { t } = useTranslation('v2', { keyPrefix: 'storage_units_offsite_storage' });
  const [records, setRecords] = useState<RecordType[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(database, dek, 'StorageUnitRecord', storageUnitSchema).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
    ]).then(([nextRecords, nextPeople]) => { setRecords(nextRecords); setPeople(nextPeople); });
  };
  useEffect(load, [database, dek]);
  const personName = (id: string) => {
    const person = people.find((item) => item.id === id);
    return person ? `${person.legalFirstName} ${person.legalLastName}` : t('accountHolder');
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !form.facility.trim() || !form.address.trim() || !form.unitNumber.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(database, dek, 'StorageUnitRecord', storageUnitSchema).put({ id: crypto.randomUUID(), schemaVersion: 1, createdAt: now, updatedAt: now, ...form, facility: form.facility.trim(), address: form.address.trim(), unitNumber: form.unitNumber.trim() });
    setForm(empty); setSaved(true); load();
  };
  const selectedAuthorized = form.authorizedPersonIds ? form.authorizedPersonIds.split(',').filter(Boolean) : [];
  const setAuthorized = (values: string[]) => setForm({ ...form, authorizedPersonIds: values.join(',') });
  return <section className="section-page v2-feature"><p className="eyebrow">{t('title')}</p><h2>{t('title')}</h2><p>{t('intro')}</p><p className="security-clarification">{t('caution')}</p><div className="section-card"><h3>{t('summary')}</h3>{records.length === 0 ? <p>{t('empty')}</p> : <ul>{records.map((record) => <li key={record.id}>{record.facility} — {record.unitNumberPolicy === 'hidden' ? t('hidden') : record.unitNumberPolicy === 'last4' ? `••••${record.unitNumber.slice(-4)}` : record.unitNumber} — {personName(record.accountHolderId)}</li>)}</ul>}</div><div className="section-card"><h3>{t('add')}</h3><form onSubmit={(event) => void save(event)}><div className="form-grid"><TextField label={t('facility')} value={form.facility} onChange={(event) => setForm({ ...form, facility: event.target.value })} required /><TextArea label={t('address')} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required /><TextField label={t('unitNumber')} value={form.unitNumber} onChange={(event) => setForm({ ...form, unitNumber: event.target.value })} required /><SelectField label={t('unitNumberPolicy')} value={form.unitNumberPolicy} onChange={(event) => setForm({ ...form, unitNumberPolicy: event.target.value as RecordType['unitNumberPolicy'] })} options={(['full', 'last4', 'hidden'] as const).map((value) => ({ value, label: t(value) }))} /><SelectField label={t('accountHolder')} value={form.accountHolderId} onChange={(event) => setForm({ ...form, accountHolderId: event.target.value })} options={[{ value: '', label: t('unknown') }, ...people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))]} /><TextField label={t('monthlyCost')} value={form.monthlyCost} onChange={(event) => setForm({ ...form, monthlyCost: event.target.value })} /><TextField label={t('paymentSource')} value={form.paymentSource} onChange={(event) => setForm({ ...form, paymentSource: event.target.value })} /><TextField label={t('accessKeyLocation')} value={form.accessKeyLocation} onChange={(event) => setForm({ ...form, accessKeyLocation: event.target.value })} /><SelectField label={t('authorizedPersons')} multiple value={selectedAuthorized} onChange={(event) => setAuthorized(Array.from(event.target.selectedOptions, (option) => option.value))} options={people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))} /></div><TextArea label={t('contentsSummary')} value={form.contentsSummary} onChange={(event) => setForm({ ...form, contentsSummary: event.target.value })} /><TextArea label={t('insurance')} value={form.insurance} onChange={(event) => setForm({ ...form, insurance: event.target.value })} /><TextArea label={t('contact')} value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /><TextArea label={t('supportingDocumentLocation')} value={form.supportingDocumentLocation} onChange={(event) => setForm({ ...form, supportingDocumentLocation: event.target.value })} /><TextField label={t('primaryContact')} value={form.primaryContact} onChange={(event) => setForm({ ...form, primaryContact: event.target.value })} /><TextArea label={t('preparerNotes')} value={form.preparerNotes} onChange={(event) => setForm({ ...form, preparerNotes: event.target.value })} /><TextArea label={t('notes')} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /><SelectField label={t('printPolicy')} value={form.printPolicy} onChange={(event) => setForm({ ...form, printPolicy: event.target.value as RecordType['printPolicy'] })} options={(['full', 'last4', 'hidden'] as const).map((value) => ({ value, label: t(value) }))} /><label><input type="checkbox" checked={form.includeInPrint} onChange={(event) => setForm({ ...form, includeInPrint: event.target.checked })} /> {t('includeInPrint')}</label><label><input type="checkbox" checked={form.includeInReadableExport} onChange={(event) => setForm({ ...form, includeInReadableExport: event.target.checked })} /> {t('includeInReadableExport')}</label><button className="button button-primary">{t('save')}</button>{saved && <p role="status">{t('saved')}</p>}</form></div><div className="section-card paper-actions"><h3>{t('paperActions')}</h3><p>☐ {t('facilityContacted')}  ☐ {t('accessObtained')}  ☐ {t('contentsInventoried')}  ☐ {t('unitClosedContinued')}</p><p>{t('date')}: ____ / ____ / ______  {t('initials')}: __________  {t('reference')}: ____________________</p><div className="handwriting-lines" aria-hidden="true" /></div></section>;
}
