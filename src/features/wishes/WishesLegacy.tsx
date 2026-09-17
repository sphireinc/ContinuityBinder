import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { TextArea, TextField, SelectField } from '../../components/forms';
import {
  createEncryptedRepository,
  type ContinuityDatabase,
} from '../../data/repositories/encryptedRepository';
import { personSchema } from '../household/HouseholdSetup';
import { propertyAssetSchema } from '../property/PropertyAssets';

const base = {
  id: z.string(),
  schemaVersion: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
};
export const wishesSchema = z.object({
  ...base,
  personId: z.string(),
  arrangement: z.enum(['burial', 'cremation', 'other', 'undecided']),
  funeralHome: z.string().optional(),
  cemetery: z.string().optional(),
  religious: z.string().optional(),
  viewing: z.string().optional(),
  ceremony: z.string().optional(),
  music: z.string().optional(),
  clothing: z.string().optional(),
  obituary: z.string().optional(),
  speakers: z.string().optional(),
  flowers: z.string().optional(),
  ashes: z.string().optional(),
  military: z.string().optional(),
  organ: z.string().optional(),
  prepaid: z.string().optional(),
  instructions: z.string().optional(),
});
export const heirloomSchema = z.object({
  ...base,
  propertyId: z.string(),
  story: z.string(),
});
export const personalLetterSchema = z.object({
  ...base,
  author: z.string(),
  recipients: z.string(),
  title: z.string(),
  body: z.string(),
  includePrint: z.boolean(),
  newPage: z.boolean(),
  sealed: z.boolean(),
});
type Person = { id: string; name: string };
type Wishes = z.infer<typeof wishesSchema>;
type Heirloom = z.infer<typeof heirloomSchema>;
type Letter = z.infer<typeof personalLetterSchema>;
type Asset = { id: string; label: string };
const emptyWishes = {
  personId: '',
  arrangement: 'undecided',
  funeralHome: '',
  cemetery: '',
  religious: '',
  viewing: '',
  ceremony: '',
  music: '',
  clothing: '',
  obituary: '',
  speakers: '',
  flowers: '',
  ashes: '',
  military: '',
  organ: '',
  prepaid: '',
  instructions: '',
};
const emptyHeirloom = { propertyId: '', story: '' };
const emptyLetter = {
  author: '',
  recipients: '',
  title: '',
  body: '',
  includePrint: false,
  newPage: true,
  sealed: false,
};

export function WishesLegacy({
  database,
  dek,
}: {
  database: ContinuityDatabase | null;
  dek: CryptoKey;
}) {
  const { t } = useTranslation('wishes');
  const [people, setPeople] = useState<Person[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [wishes, setWishes] = useState<Wishes[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [heirlooms, setHeirlooms] = useState<Heirloom[]>([]);
  const [person, setPerson] = useState(emptyWishes);
  const [heirloom, setHeirloom] = useState(emptyHeirloom);
  const [letter, setLetter] = useState(emptyLetter);
  const [saved, setSaved] = useState(false);
  const load = () => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(database, dek, 'Wishes', wishesSchema).list(),
      createEncryptedRepository(
        database,
        dek,
        'HeirloomNote',
        heirloomSchema,
      ).list(),
      createEncryptedRepository(
        database,
        dek,
        'PersonalLetter',
        personalLetterSchema,
      ).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
      createEncryptedRepository(
        database,
        dek,
        'PropertyAsset',
        propertyAssetSchema,
      ).list(),
    ]).then(
      ([nextWishes, nextHeirlooms, nextLetters, nextPeople, nextAssets]) => {
        setWishes(nextWishes);
        setHeirlooms(nextHeirlooms);
        setLetters(nextLetters);
        setPeople(
          nextPeople.map((item) => ({
            id: item.id,
            name: `${item.legalFirstName} ${item.legalLastName}`,
          })),
        );
        setAssets(
          nextAssets.map((item) => ({ id: item.id, label: item.label })),
        );
      },
    );
  };
  useEffect(load, [database, dek]);
  const saveWishes = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !person.personId) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(database, dek, 'Wishes', wishesSchema).put({
      id: crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      ...person,
      arrangement: person.arrangement as Wishes['arrangement'],
    });
    setPerson(emptyWishes);
    setSaved(true);
    load();
  };
  const saveHeirloom = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !heirloom.propertyId) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(
      database,
      dek,
      'HeirloomNote',
      heirloomSchema,
    ).put({
      id: crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      ...heirloom,
    });
    setHeirloom(emptyHeirloom);
    setSaved(true);
    load();
  };
  const saveLetter = async (event: FormEvent) => {
    event.preventDefault();
    if (!database || !letter.title.trim() || !letter.body.trim()) return;
    const now = new Date().toISOString();
    await createEncryptedRepository(
      database,
      dek,
      'PersonalLetter',
      personalLetterSchema,
    ).put({
      id: crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      ...letter,
    });
    setLetter(emptyLetter);
    setSaved(true);
    load();
  };
  return (
    <section className="section-page">
      <p className="eyebrow">{t('title')}</p>
      <h2>{t('title')}</h2>
      <p className="security-clarification">{t('notice')}</p>
      <div className="section-card">
        <h3>{t('funeral')}</h3>
        <form onSubmit={(event) => void saveWishes(event)}>
          <SelectField
            label={t('person')}
            value={person.personId}
            onChange={(event) =>
              setPerson({ ...person, personId: event.target.value })
            }
            options={[
              { value: '', label: t('person') },
              ...people.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
          <SelectField
            label={t('arrangement')}
            value={person.arrangement}
            onChange={(event) =>
              setPerson({ ...person, arrangement: event.target.value })
            }
            options={['burial', 'cremation', 'other', 'undecided'].map(
              (value) => ({ value, label: t(`arrangements.${value}`) }),
            )}
          />
          <TextField
            label={t('funeralHome')}
            value={person.funeralHome}
            onChange={(event) =>
              setPerson({ ...person, funeralHome: event.target.value })
            }
          />
          <TextField
            label={t('cemetery')}
            value={person.cemetery}
            onChange={(event) =>
              setPerson({ ...person, cemetery: event.target.value })
            }
          />
          <TextField
            label={t('religious')}
            value={person.religious}
            onChange={(event) =>
              setPerson({ ...person, religious: event.target.value })
            }
          />
          <TextArea
            label={t('viewing')}
            value={person.viewing}
            onChange={(event) =>
              setPerson({ ...person, viewing: event.target.value })
            }
          />
          <TextArea
            label={t('ceremony')}
            value={person.ceremony}
            onChange={(event) =>
              setPerson({ ...person, ceremony: event.target.value })
            }
          />
          <TextArea
            label={t('music')}
            value={person.music}
            onChange={(event) =>
              setPerson({ ...person, music: event.target.value })
            }
          />
          <TextArea
            label={t('clothing')}
            value={person.clothing}
            onChange={(event) =>
              setPerson({ ...person, clothing: event.target.value })
            }
          />
          <TextArea
            label={t('obituary')}
            value={person.obituary}
            onChange={(event) =>
              setPerson({ ...person, obituary: event.target.value })
            }
          />
          <TextArea
            label={t('speakers')}
            value={person.speakers}
            onChange={(event) =>
              setPerson({ ...person, speakers: event.target.value })
            }
          />
          <TextArea
            label={t('flowers')}
            value={person.flowers}
            onChange={(event) =>
              setPerson({ ...person, flowers: event.target.value })
            }
          />
          <TextArea
            label={t('ashes')}
            value={person.ashes}
            onChange={(event) =>
              setPerson({ ...person, ashes: event.target.value })
            }
          />
          <TextArea
            label={t('military')}
            value={person.military}
            onChange={(event) =>
              setPerson({ ...person, military: event.target.value })
            }
          />
          <TextArea
            label={t('organ')}
            value={person.organ}
            onChange={(event) =>
              setPerson({ ...person, organ: event.target.value })
            }
          />
          <TextArea
            label={t('prepaid')}
            value={person.prepaid}
            onChange={(event) =>
              setPerson({ ...person, prepaid: event.target.value })
            }
          />
          <TextArea
            label={t('instructions')}
            value={person.instructions}
            onChange={(event) =>
              setPerson({ ...person, instructions: event.target.value })
            }
          />
          <button className="button button-primary">{t('save')}</button>
        </form>
        {wishes.length > 0 && (
          <p>
            {t('saved')}: {wishes.length}
          </p>
        )}
      </div>
      <div className="section-card">
        <h3>{t('heirlooms')}</h3>
        <p>{t('willBoundary')}</p>
        <form onSubmit={(event) => void saveHeirloom(event)}>
          <SelectField
            label={t('property')}
            value={heirloom.propertyId}
            onChange={(event) =>
              setHeirloom({ ...heirloom, propertyId: event.target.value })
            }
            options={[
              { value: '', label: t('property') },
              ...assets.map((item) => ({ value: item.id, label: item.label })),
            ]}
          />
          <TextArea
            label={t('story')}
            value={heirloom.story}
            onChange={(event) =>
              setHeirloom({ ...heirloom, story: event.target.value })
            }
          />
          <button className="button button-primary">{t('save')}</button>
        </form>
        {heirlooms.length > 0 && (
          <p>
            {t('saved')}: {heirlooms.length}
          </p>
        )}
      </div>
      <div className="section-card">
        <h3>{t('letters')}</h3>
        <p>{t('safeText')}</p>
        <form onSubmit={(event) => void saveLetter(event)}>
          <TextField
            label={t('author')}
            value={letter.author}
            onChange={(event) =>
              setLetter({ ...letter, author: event.target.value })
            }
          />
          <TextField
            label={t('recipients')}
            value={letter.recipients}
            onChange={(event) =>
              setLetter({ ...letter, recipients: event.target.value })
            }
          />
          <TextField
            label={t('letterTitle')}
            value={letter.title}
            onChange={(event) =>
              setLetter({ ...letter, title: event.target.value })
            }
            required
          />
          <TextArea
            label={t('body')}
            value={letter.body}
            onChange={(event) =>
              setLetter({ ...letter, body: event.target.value })
            }
            required
          />
          <label>
            <input
              type="checkbox"
              checked={letter.includePrint}
              onChange={(event) =>
                setLetter({ ...letter, includePrint: event.target.checked })
              }
            />{' '}
            {t('includePrint')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={letter.newPage}
              onChange={(event) =>
                setLetter({ ...letter, newPage: event.target.checked })
              }
            />{' '}
            {t('newPage')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={letter.sealed}
              onChange={(event) =>
                setLetter({ ...letter, sealed: event.target.checked })
              }
            />{' '}
            {t('sealed')}
          </label>
          <button className="button button-primary">{t('save')}</button>
        </form>
        {letters
          .filter((item) => item.sealed)
          .map((item) => (
            <p key={item.id}>
              {t('sealedCover', { recipient: item.recipients })}
            </p>
          ))}
        {saved && <p role="status">{t('saved')}</p>}
      </div>
    </section>
  );
}
