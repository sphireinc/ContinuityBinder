import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectField, TextArea, TextField } from '../../components/forms';
import { personSchema } from '../household/HouseholdSetup';
import { createEncryptedRepository, type ContinuityDatabase } from '../../data/repositories/encryptedRepository';

const base = { id: z.string(), schemaVersion: z.number(), createdAt: z.string(), updatedAt: z.string() };
export const incapacityPlanSchema = z.object({
  ...base,
  personId: z.string(), condition: z.string(), financialAgent: z.string(), healthcareAgent: z.string(), householdManager: z.string(), dependentContact: z.string(), businessContact: z.string(), obligations: z.string(), documentLocations: z.string(), instructions: z.string(), supportingDocument: z.string(), primaryContact: z.string(), preparerNotes: z.string(), printPolicy: z.enum(['full', 'last4', 'hidden']), includeInPrint: z.boolean(), includeInReadableExport: z.boolean(),
});
type Plan = z.infer<typeof incapacityPlanSchema>;
type Person = z.infer<typeof personSchema>;
type FormState = Omit<Plan, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt'>;
const empty = { personId: '', condition: '', financialAgent: '', healthcareAgent: '', householdManager: '', dependentContact: '', businessContact: '', obligations: '', documentLocations: '', instructions: '', supportingDocument: '', primaryContact: '', preparerNotes: '', printPolicy: 'hidden' as const, includeInPrint: true, includeInReadableExport: true };

export function IncapacityContinuityPlan({ database, dek }: { database: ContinuityDatabase | null; dek: CryptoKey }) {
  const { t } = useTranslation('v2', { keyPrefix: 'incapacity_continuity_plan' });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(database, dek, 'IncapacityContinuityPlan', incapacityPlanSchema).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
    ]).then(([nextPlans, nextPeople]) => { setPlans(nextPlans); setPeople(nextPeople); });
  };
  useEffect(load, [database, dek]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !form.personId || !form.condition.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(database, dek, 'IncapacityContinuityPlan', incapacityPlanSchema).put({ id: crypto.randomUUID(), schemaVersion: 1, createdAt: now, updatedAt: now, ...form, condition: form.condition.trim() });
    setForm(empty); setSaved(true); load();
  };
  const personName = (id: string) => { const person = people.find((item) => item.id === id); return person ? `${person.legalFirstName} ${person.legalLastName}` : t('person'); };
  return <section className="section-page v2-feature">
    <p className="eyebrow">{t('title')}</p><h2>{t('title')}</h2><p>{t('intro')}</p><p className="security-clarification">{t('caution')}</p>
    <div className="section-card"><h3>{t('summary')}</h3>{plans.length === 0 ? <p>{t('empty')}</p> : <ul>{plans.map((plan) => <li key={plan.id}>{personName(plan.personId)} — {plan.condition}</li>)}</ul>}</div>
    <div className="section-card"><h3>{t('add')}</h3><form onSubmit={(event) => void save(event)}>
      <SelectField label={t('person')} value={form.personId} onChange={(event) => setForm({ ...form, personId: event.target.value })} options={[{ value: '', label: t('person') }, ...people.map((person) => ({ value: person.id, label: `${person.legalFirstName} ${person.legalLastName}` }))]} />
      <TextField label={t('condition')} value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })} required />
      <div className="form-grid">{(['financialAgent', 'healthcareAgent', 'householdManager', 'dependentContact', 'businessContact', 'supportingDocument', 'primaryContact'] as const).map((key) => <TextField key={key} label={t(key)} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />)}</div>
      <TextArea label={t('obligations')} value={form.obligations} onChange={(event) => setForm({ ...form, obligations: event.target.value })} /><TextArea label={t('documentLocations')} value={form.documentLocations} onChange={(event) => setForm({ ...form, documentLocations: event.target.value })} /><TextArea label={t('instructions')} value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} /><TextArea label={t('preparerNotes')} value={form.preparerNotes} onChange={(event) => setForm({ ...form, preparerNotes: event.target.value })} />
      <SelectField label={t('printPolicy')} value={form.printPolicy} onChange={(event) => setForm({ ...form, printPolicy: event.target.value as Plan['printPolicy'] })} options={(['full', 'last4', 'hidden'] as const).map((value) => ({ value, label: t(value) }))} />
      <label><input type="checkbox" checked={form.includeInPrint} onChange={(event) => setForm({ ...form, includeInPrint: event.target.checked })} /> {t('includeInPrint')}</label><label><input type="checkbox" checked={form.includeInReadableExport} onChange={(event) => setForm({ ...form, includeInReadableExport: event.target.checked })} /> {t('includeInExport')}</label><button className="button button-primary">{t('save')}</button>{saved && <p role="status">{t('saved')}</p>}
    </form></div>
    <div className="section-card paper-actions"><h3>{t('paperActions')}</h3><p>☐ {t('authorityConfirmed')}</p><p>☐ {t('contactsReached')}</p><p>☐ {t('billsReviewed')}</p><p>☐ {t('careActivated')}</p></div>
  </section>;
}
