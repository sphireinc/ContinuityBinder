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
export const dependentSchema = z.object({
  ...base,
  linkedPersonId: z.string(),
  guardians: z.string().optional(),
  school: z.string().optional(),
  physician: z.string().optional(),
  insurance: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  routines: z.string().optional(),
  college: z.string().optional(),
  contacts: z.string().optional(),
  continuityLetter: z.string().optional(),
});
export const petSchema = z.object({
  ...base,
  name: z.string(),
  species: z.string(),
  veterinarian: z.string().optional(),
  insurance: z.string().optional(),
  feeding: z.string().optional(),
  medications: z.string().optional(),
  emergency: z.string().optional(),
});
export const routineSchema = z.object({
  ...base,
  title: z.string(),
  frequency: z.string(),
  responsiblePersonId: z.string().optional(),
  instructions: z.string(),
  contact: z.string().optional(),
  related: z.string().optional(),
  importance: z.enum(['critical', 'important', 'routine']),
});
export const careSchema = z.object({
  ...base,
  primaryPhysician: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalInsurance: z.string().optional(),
  recordsLocation: z.string().optional(),
  emergency: z.string().optional(),
});
type Person = { id: string; name: string };
type Pet = z.infer<typeof petSchema>;
type Routine = z.infer<typeof routineSchema>;
type Care = z.infer<typeof careSchema>;
const emptyPet = {
  name: '',
  species: '',
  veterinarian: '',
  insurance: '',
  feeding: '',
  medications: '',
  emergency: '',
};
const emptyRoutine = {
  title: '',
  frequency: '',
  responsiblePersonId: '',
  instructions: '',
  contact: '',
  related: '',
  importance: 'routine',
};
const emptyCare = {
  primaryPhysician: '',
  allergies: '',
  medications: '',
  medicalInsurance: '',
  recordsLocation: '',
  emergency: '',
};

export function FamilyCare({
  database,
  dek,
}: {
  database: ContinuityDatabase | null;
  dek: CryptoKey;
}) {
  const { t } = useTranslation('care');
  const [pets, setPets] = useState<Pet[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [care, setCare] = useState<Care | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [pet, setPet] = useState(emptyPet);
  const [routine, setRoutine] = useState(emptyRoutine);
  const [medical, setMedical] = useState(emptyCare);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(database, dek, 'Pet', petSchema).list(),
      createEncryptedRepository(
        database,
        dek,
        'HouseholdRoutine',
        routineSchema,
      ).list(),
      createEncryptedRepository(
        database,
        dek,
        'CareMedicalEssential',
        careSchema,
      ).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
    ]).then(([nextPets, nextRoutines, nextCare, nextPeople]) => {
      setPets(nextPets);
      setRoutines(nextRoutines);
      setCare(nextCare[0] ?? null);
      setPeople(
        nextPeople.map((person) => ({
          id: person.id,
          name: `${person.legalFirstName} ${person.legalLastName}`,
        })),
      );
    });
  };
  useEffect(load, [database, dek]);
  const savePet = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !pet.name.trim() || !pet.species.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(database, dek, 'Pet', petSchema).put({
      id: crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      ...pet,
    });
    setPet(emptyPet);
    setSaved(true);
    load();
  };
  const saveRoutine = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !routine.title.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(
      database,
      dek,
      'HouseholdRoutine',
      routineSchema,
    ).put({
      id: crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      ...routine,
      responsiblePersonId: routine.responsiblePersonId || undefined,
      importance: routine.importance as Routine['importance'],
    });
    setRoutine(emptyRoutine);
    setSaved(true);
    load();
  };
  const saveCare = async (event: FormEvent) => {
    event.preventDefault();
    if (!database) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(
      database,
      dek,
      'CareMedicalEssential',
      careSchema,
    ).put({
      id: care?.id ?? crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: care?.createdAt ?? now,
      updatedAt: now,
      ...medical,
    });
    setSaved(true);
    load();
  };
  return (
    <section className="section-page">
      <p className="eyebrow">{t('title')}</p>
      <h2>{t('title')}</h2>
      <p className="security-clarification">{t('disclaimer')}</p>
      <div className="section-card">
        <h3>{t('pets')}</h3>
        <form onSubmit={(event) => void savePet(event)}>
          <TextField
            label={t('name')}
            value={pet.name}
            onChange={(event) => setPet({ ...pet, name: event.target.value })}
            required
          />
          <TextField
            label={t('species')}
            value={pet.species}
            onChange={(event) =>
              setPet({ ...pet, species: event.target.value })
            }
            required
          />
          <TextField
            label={t('veterinarian')}
            value={pet.veterinarian}
            onChange={(event) =>
              setPet({ ...pet, veterinarian: event.target.value })
            }
          />
          <TextArea
            label={t('feeding')}
            value={pet.feeding}
            onChange={(event) =>
              setPet({ ...pet, feeding: event.target.value })
            }
          />
          <TextArea
            label={t('medications')}
            value={pet.medications}
            onChange={(event) =>
              setPet({ ...pet, medications: event.target.value })
            }
          />
          <TextArea
            label={t('emergency')}
            value={pet.emergency}
            onChange={(event) =>
              setPet({ ...pet, emergency: event.target.value })
            }
          />
          <button className="button button-primary">{t('save')}</button>
        </form>
        {pets.map((item) => (
          <article className="pet-care-summary" key={item.id}>
            <h4>
              {item.name} — {item.species}
            </h4>
            <p>
              {[
                item.veterinarian,
                item.insurance,
                item.feeding,
                item.medications,
                item.emergency,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <button type="button" onClick={() => window.print()}>
              {t('printPet', { defaultValue: 'Print this pet care summary' })}
            </button>
          </article>
        ))}
      </div>
      <div className="section-card">
        <h3>{t('routines')}</h3>
        <form onSubmit={(event) => void saveRoutine(event)}>
          <TextField
            label={t('titleField')}
            value={routine.title}
            onChange={(event) =>
              setRoutine({ ...routine, title: event.target.value })
            }
            required
          />
          <TextField
            label={t('frequency')}
            value={routine.frequency}
            onChange={(event) =>
              setRoutine({ ...routine, frequency: event.target.value })
            }
          />
          <SelectField
            label={t('responsible')}
            value={routine.responsiblePersonId}
            onChange={(event) =>
              setRoutine({
                ...routine,
                responsiblePersonId: event.target.value,
              })
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
            label={t('instructions')}
            value={routine.instructions}
            onChange={(event) =>
              setRoutine({ ...routine, instructions: event.target.value })
            }
          />
          <TextField
            label={t('contact')}
            value={routine.contact}
            onChange={(event) =>
              setRoutine({ ...routine, contact: event.target.value })
            }
          />
          <TextField
            label={t('related')}
            value={routine.related}
            onChange={(event) =>
              setRoutine({ ...routine, related: event.target.value })
            }
          />
          <SelectField
            label={t('importance')}
            value={routine.importance}
            onChange={(event) =>
              setRoutine({ ...routine, importance: event.target.value })
            }
            options={['critical', 'important', 'routine'].map((value) => ({
              value,
              label: t(`importanceValues.${value}`),
            }))}
          />
          <button className="button button-primary">{t('save')}</button>
        </form>
        {routines.map((item) => (
          <p key={item.id}>
            {item.title} — {t(`importanceValues.${item.importance}`)}
          </p>
        ))}
      </div>
      <div className="section-card">
        <h3>{t('medical')}</h3>
        <form onSubmit={(event) => void saveCare(event)}>
          <TextField
            label={t('primaryPhysician')}
            value={medical.primaryPhysician}
            onChange={(event) =>
              setMedical({ ...medical, primaryPhysician: event.target.value })
            }
          />
          <TextArea
            label={t('allergies')}
            value={medical.allergies}
            onChange={(event) =>
              setMedical({ ...medical, allergies: event.target.value })
            }
          />
          <TextArea
            label={t('medications')}
            value={medical.medications}
            onChange={(event) =>
              setMedical({ ...medical, medications: event.target.value })
            }
          />
          <TextField
            label={t('medicalInsurance')}
            value={medical.medicalInsurance}
            onChange={(event) =>
              setMedical({ ...medical, medicalInsurance: event.target.value })
            }
          />
          <TextField
            label={t('recordsLocation')}
            value={medical.recordsLocation}
            onChange={(event) =>
              setMedical({ ...medical, recordsLocation: event.target.value })
            }
          />
          <TextArea
            label={t('emergency')}
            value={medical.emergency}
            onChange={(event) =>
              setMedical({ ...medical, emergency: event.target.value })
            }
          />
          <button className="button button-primary">{t('save')}</button>
        </form>
        {saved && <p role="status">{t('saved')}</p>}
      </div>
    </section>
  );
}
