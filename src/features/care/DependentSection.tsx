import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { TextArea, TextField, SelectField } from '../../components/forms';
import {
  createEncryptedRepository,
  type ContinuityDatabase,
} from '../../data/repositories/encryptedRepository';
import { dependentSchema } from './FamilyCare';
import { personSchema } from '../household/HouseholdSetup';

type Dependent = {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  linkedPersonId: string;
  guardians?: string;
  school?: string;
  physician?: string;
  insurance?: string;
  allergies?: string;
  medications?: string;
  routines?: string;
  college?: string;
  contacts?: string;
  continuityLetter?: string;
};
type Person = { id: string; name: string };
const empty = {
  linkedPersonId: '',
  guardians: '',
  school: '',
  physician: '',
  insurance: '',
  allergies: '',
  medications: '',
  routines: '',
  college: '',
  contacts: '',
  continuityLetter: '',
};

export function DependentSection({
  database,
  dek,
}: {
  database: ContinuityDatabase | null;
  dek: CryptoKey;
}) {
  const { t } = useTranslation('care');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState(empty);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(
        database,
        dek,
        'Dependent',
        dependentSchema,
      ).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
    ]).then(([records, persons]) => {
      setDependents(records as Dependent[]);
      setPeople(
        persons.map((person) => ({
          id: person.id,
          name: `${person.legalFirstName} ${person.legalLastName}`,
        })),
      );
    });
  };
  useEffect(load, [database, dek]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !form.linkedPersonId) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(
      database,
      dek,
      'Dependent',
      dependentSchema,
    ).put({
      id: crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      ...form,
    });
    setForm(empty);
    load();
  };
  return (
    <section className="section-card">
      <h3>{t('dependents')}</h3>
      <p>{t('guardianNote')}</p>
      <form onSubmit={(event) => void save(event)}>
        <SelectField
          label={t('linkedPerson')}
          value={form.linkedPersonId}
          onChange={(event) =>
            setForm({ ...form, linkedPersonId: event.target.value })
          }
          options={[
            { value: '', label: t('linkedPerson') },
            ...people.map((person) => ({
              value: person.id,
              label: person.name,
            })),
          ]}
        />
        <TextArea
          label={t('guardians')}
          value={form.guardians}
          onChange={(event) =>
            setForm({ ...form, guardians: event.target.value })
          }
        />
        <TextField
          label={t('school')}
          value={form.school}
          onChange={(event) => setForm({ ...form, school: event.target.value })}
        />
        <TextField
          label={t('physician')}
          value={form.physician}
          onChange={(event) =>
            setForm({ ...form, physician: event.target.value })
          }
        />
        <TextField
          label={t('insurance')}
          value={form.insurance}
          onChange={(event) =>
            setForm({ ...form, insurance: event.target.value })
          }
        />
        <TextArea
          label={t('allergies')}
          value={form.allergies}
          onChange={(event) =>
            setForm({ ...form, allergies: event.target.value })
          }
        />
        <TextArea
          label={t('medications')}
          value={form.medications}
          onChange={(event) =>
            setForm({ ...form, medications: event.target.value })
          }
        />
        <TextArea
          label={t('routine')}
          value={form.routines}
          onChange={(event) =>
            setForm({ ...form, routines: event.target.value })
          }
        />
        <TextField
          label={t('college')}
          value={form.college}
          onChange={(event) =>
            setForm({ ...form, college: event.target.value })
          }
        />
        <TextField
          label={t('contacts')}
          value={form.contacts}
          onChange={(event) =>
            setForm({ ...form, contacts: event.target.value })
          }
        />
        <TextField
          label={t('continuityLetter')}
          value={form.continuityLetter}
          onChange={(event) =>
            setForm({ ...form, continuityLetter: event.target.value })
          }
        />
        <button className="button button-primary">{t('save')}</button>
      </form>
      {dependents.map((item) => (
        <p key={item.id}>
          {people.find((person) => person.id === item.linkedPersonId)?.name ??
            t('linkedPerson')}
        </p>
      ))}
    </section>
  );
}
