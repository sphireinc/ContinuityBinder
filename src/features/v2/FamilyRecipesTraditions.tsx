import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectField, TextArea, TextField } from '../../components/forms';
import { createEncryptedRepository, type ContinuityDatabase } from '../../data/repositories/encryptedRepository';
import { personSchema } from '../household/HouseholdSetup';

const base = { id: z.string(), schemaVersion: z.number(), createdAt: z.string(), updatedAt: z.string() };
export const familyRecipeTraditionSchema = z.object({
  ...base,
  title: z.string(),
  type: z.string(),
  originPersonId: z.string(),
  ingredientsMaterials: z.string(),
  instructions: z.string(),
  whenObserved: z.string(),
  participantIds: z.string(),
  storyContext: z.string(),
  photoLocation: z.string(),
  supportingDocumentLocation: z.string(),
  primaryContact: z.string(),
  preparerNotes: z.string(),
  notes: z.string(),
  printPolicy: z.enum(['full', 'last4', 'hidden']),
  includeInPrint: z.boolean(),
  includeInReadableExport: z.boolean(),
});
type RecordType = z.infer<typeof familyRecipeTraditionSchema>;
type Person = z.infer<typeof personSchema>;
type FormState = Omit<RecordType, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>;

const empty: FormState = {
  title: '', type: '', originPersonId: '', ingredientsMaterials: '', instructions: '', whenObserved: '', participantIds: '', storyContext: '', photoLocation: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
};

export function FamilyRecipesTraditions({ database, dek }: { database: ContinuityDatabase | null; dek: CryptoKey }) {
  const { t } = useTranslation('v2', { keyPrefix: 'family_recipes_traditions' });
  const [records, setRecords] = useState<RecordType[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(database, dek, 'FamilyRecipeTraditionRecord', familyRecipeTraditionSchema).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
    ]).then(([nextRecords, nextPeople]) => { setRecords(nextRecords); setPeople(nextPeople); });
  };
  useEffect(load, [database, dek]);
  const name = (id: string) => {
    const person = people.find((item) => item.id === id);
    return person ? `${person.legalFirstName} ${person.legalLastName}` : t('unknown');
  };
  const selectedParticipants = form.participantIds ? form.participantIds.split(',').filter(Boolean) : [];
  const setParticipants = (values: string[]) => setForm({ ...form, participantIds: values.join(',') });
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !form.title.trim() || !form.type.trim() || !form.instructions.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(database, dek, 'FamilyRecipeTraditionRecord', familyRecipeTraditionSchema).put({ id: crypto.randomUUID(), schemaVersion: 1, createdAt: now, updatedAt: now, ...form, title: form.title.trim(), type: form.type.trim(), instructions: form.instructions.trim() });
    setForm(empty); setSaved(true); load();
  };
  const personOptions = [{ value: '', label: t('unknown') }, ...people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))];
  return <section className="section-page v2-feature"><p className="eyebrow">{t('title')}</p><h2>{t('title')}</h2><p>{t('intro')}</p><p className="security-clarification">{t('caution')}</p><div className="section-card"><h3>{t('summary')}</h3>{records.length === 0 ? <p>{t('empty')}</p> : <ul>{records.map((record) => <li key={record.id}>{record.title} — {record.type} — {name(record.originPersonId)}</li>)}</ul>}</div><div className="section-card"><h3>{t('add')}</h3><form onSubmit={(event) => void save(event)}><div className="form-grid"><TextField label={t('titleField')} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /><TextField label={t('type')} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} required /><SelectField label={t('originPerson')} value={form.originPersonId} onChange={(event) => setForm({ ...form, originPersonId: event.target.value })} options={personOptions} /><TextField label={t('whenObserved')} value={form.whenObserved} onChange={(event) => setForm({ ...form, whenObserved: event.target.value })} /><TextField label={t('photoLocation')} value={form.photoLocation} onChange={(event) => setForm({ ...form, photoLocation: event.target.value })} /><SelectField label={t('whoParticipates')} multiple value={selectedParticipants} onChange={(event) => setParticipants(Array.from(event.target.selectedOptions, (option) => option.value))} options={people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))} /></div><TextArea label={t('ingredientsMaterials')} value={form.ingredientsMaterials} onChange={(event) => setForm({ ...form, ingredientsMaterials: event.target.value })} /><TextArea label={t('instructions')} value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} required /><TextArea label={t('storyContext')} value={form.storyContext} onChange={(event) => setForm({ ...form, storyContext: event.target.value })} /><TextArea label={t('supportingDocumentLocation')} value={form.supportingDocumentLocation} onChange={(event) => setForm({ ...form, supportingDocumentLocation: event.target.value })} /><TextField label={t('primaryContact')} value={form.primaryContact} onChange={(event) => setForm({ ...form, primaryContact: event.target.value })} /><TextArea label={t('preparerNotes')} value={form.preparerNotes} onChange={(event) => setForm({ ...form, preparerNotes: event.target.value })} /><TextArea label={t('notes')} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /><SelectField label={t('printPolicy')} value={form.printPolicy} onChange={(event) => setForm({ ...form, printPolicy: event.target.value as RecordType['printPolicy'] })} options={(['full', 'last4', 'hidden'] as const).map((value) => ({ value, label: t(value) }))} /><label><input type="checkbox" checked={form.includeInPrint} onChange={(event) => setForm({ ...form, includeInPrint: event.target.checked })} /> {t('includeInPrint')}</label><label><input type="checkbox" checked={form.includeInReadableExport} onChange={(event) => setForm({ ...form, includeInReadableExport: event.target.checked })} /> {t('includeInReadableExport')}</label><button className="button button-primary">{t('save')}</button>{saved && <p role="status">{t('saved')}</p>}</form></div><div className="section-card paper-actions"><h3>{t('handwrittenNotes')}</h3><p>{t('variations')}: ________________________________________________________________</p><div className="handwriting-lines" aria-hidden="true" /><p>{t('familyNotes')}: ________________________________________________________________</p><div className="handwriting-lines" aria-hidden="true" /></div></section>;
}
