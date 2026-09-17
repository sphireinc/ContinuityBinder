import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { TextArea, TextField, SelectField } from '../../components/forms';
import {
  createEncryptedRepository,
  type ContinuityDatabase,
} from '../../data/repositories/encryptedRepository';
import { personSchema } from '../household/HouseholdSetup';

const base = {
  id: z.string(),
  schemaVersion: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
};
export const financialAccountSchema = z.object({
  ...base,
  institution: z.string(),
  ownerIds: z.array(z.string()),
  kind: z.enum([
    'checking',
    'savings',
    'moneyMarket',
    'cd',
    'creditUnion',
    'cashReserve',
    'safeDeposit',
    'paymentApp',
    'taxable',
    'traditionalIra',
    'rothIra',
    '401k',
    '403b',
    'pension',
    'annuity',
    'hsa',
    'stockPlan',
    'rsu',
    'treasury',
    'crypto',
    'private',
    'other',
  ]),
  identifier: z.string(),
  displayPolicy: z.enum(['include', 'range', 'omit']),
  beneficiaryNotes: z.string().optional(),
  approximateBalance: z.string().optional(),
  purpose: z.string().optional(),
  accessReference: z.string().optional(),
  documentLocation: z.string().optional(),
  notes: z.string().optional(),
});
type Account = z.infer<typeof financialAccountSchema>;
type Person = { id: string; name: string };
const kinds = [
  'checking',
  'savings',
  'moneyMarket',
  'cd',
  'creditUnion',
  'cashReserve',
  'safeDeposit',
  'paymentApp',
  'taxable',
  'traditionalIra',
  'rothIra',
  '401k',
  '403b',
  'pension',
  'annuity',
  'hsa',
  'stockPlan',
  'rsu',
  'treasury',
  'crypto',
  'private',
  'other',
] as const;
const empty = {
  institution: '',
  ownerIds: [] as string[],
  kind: 'checking',
  identifier: '',
  displayPolicy: 'omit',
  beneficiaryNotes: '',
  approximateBalance: '',
  purpose: '',
  accessReference: '',
  documentLocation: '',
  notes: '',
};

export function FinanceAccounts({
  database,
  dek,
}: {
  database: ContinuityDatabase | null;
  dek: CryptoKey;
}) {
  const { t } = useTranslation('finance');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(
        database,
        dek,
        'FinancialAccount',
        financialAccountSchema,
      ).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
    ]).then(([nextAccounts, nextPeople]) => {
      setAccounts(nextAccounts);
      setPeople(
        nextPeople.map((person) => ({
          id: person.id,
          name: `${person.legalFirstName} ${person.legalLastName}`,
        })),
      );
    });
  };
  useEffect(load, [database, dek]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !form.institution.trim() || !form.identifier.trim())
      return;
    const now = new Date().toISOString();
    await createEncryptedRepository(
      database,
      dek,
      'FinancialAccount',
      financialAccountSchema,
    ).put({
      id: crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      institution: form.institution.trim(),
      ownerIds: form.ownerIds,
      kind: form.kind as Account['kind'],
      identifier: form.identifier.trim(),
      displayPolicy: form.displayPolicy as Account['displayPolicy'],
      beneficiaryNotes: form.beneficiaryNotes.trim() || undefined,
      approximateBalance: form.approximateBalance.trim() || undefined,
      purpose: form.purpose.trim() || undefined,
      accessReference: form.accessReference.trim() || undefined,
      documentLocation: form.documentLocation.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setForm(empty);
    setSaved(true);
    load();
  };
  const value = (item: Account) =>
    item.displayPolicy === 'omit'
      ? t('noValues')
      : item.displayPolicy === 'range'
        ? item.approximateBalance || t('range')
        : item.approximateBalance || t('include');
  return (
    <section className="section-page">
      <p className="eyebrow">{t('title')}</p>
      <h2>{t('accountList')}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('institution')}</th>
              <th>{t('owners')}</th>
              <th>{t('accountType')}</th>
              <th>{t('identifier')}</th>
              <th>{t('balance')}</th>
              <th>{t('beneficiary')}</th>
              <th>{t('documentLocation')}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={7}>{t('noAccounts')}</td>
              </tr>
            ) : (
              accounts.map((item) => (
                <tr key={item.id}>
                  <td>{item.institution}</td>
                  <td>
                    {item.ownerIds
                      .map(
                        (id) =>
                          people.find((person) => person.id === id)?.name ??
                          t('none'),
                      )
                      .join(', ')}
                  </td>
                  <td>{t(`types.${item.kind}`)}</td>
                  <td>
                    {item.displayPolicy === 'include'
                      ? item.identifier
                      : `••••${item.identifier.slice(-4)}`}
                  </td>
                  <td>{value(item)}</td>
                  <td>{item.beneficiaryNotes ?? ''}</td>
                  <td>{item.documentLocation ?? t('none')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="security-clarification">{t('cryptoNote')}</p>
      <div className="section-card">
        <h3>{t('addAccount')}</h3>
        <form onSubmit={(event) => void save(event)}>
          <TextField
            label={t('institution')}
            value={form.institution}
            onChange={(event) =>
              setForm({ ...form, institution: event.target.value })
            }
            required
          />
          <SelectField
            label={t('owners')}
            multiple
            value={form.ownerIds}
            onChange={(event) =>
              setForm({
                ...form,
                ownerIds: Array.from(event.target.selectedOptions, (option) => option.value),
              })
            }
            options={[
              ...people.map((person) => ({
                value: person.id,
                label: person.name,
              })),
            ]}
          />
          <SelectField
            label={t('accountType')}
            value={form.kind}
            onChange={(event) => setForm({ ...form, kind: event.target.value })}
            options={kinds.map((kind) => ({
              value: kind,
              label: t(`types.${kind}`),
            }))}
          />
          <TextField
            label={t('identifier')}
            value={form.identifier}
            onChange={(event) =>
              setForm({ ...form, identifier: event.target.value })
            }
            required
          />
          <SelectField
            label={t('displayPolicy')}
            value={form.displayPolicy}
            onChange={(event) =>
              setForm({ ...form, displayPolicy: event.target.value })
            }
            options={[
              { value: 'omit', label: t('noValues') },
              { value: 'range', label: t('range') },
              { value: 'include', label: t('include') },
            ]}
          />
          <TextField
            label={t('balance')}
            value={form.approximateBalance}
            onChange={(event) =>
              setForm({ ...form, approximateBalance: event.target.value })
            }
          />
          <TextArea
            label={t('beneficiary')}
            value={form.beneficiaryNotes}
            onChange={(event) =>
              setForm({ ...form, beneficiaryNotes: event.target.value })
            }
          />
          <TextField
            label={t('purpose')}
            value={form.purpose}
            onChange={(event) =>
              setForm({ ...form, purpose: event.target.value })
            }
          />
          <TextField
            label={t('accessReference')}
            value={form.accessReference}
            onChange={(event) =>
              setForm({ ...form, accessReference: event.target.value })
            }
          />
          <TextField
            label={t('documentLocation')}
            value={form.documentLocation}
            onChange={(event) =>
              setForm({ ...form, documentLocation: event.target.value })
            }
          />
          <TextArea
            label={t('notes')}
            value={form.notes}
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
          />
          <button className="button button-primary">{t('save')}</button>
        </form>
        {saved && <p role="status">{t('saved')}</p>}
      </div>
    </section>
  );
}
