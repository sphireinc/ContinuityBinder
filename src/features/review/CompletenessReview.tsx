import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  createEncryptedRepository,
  type ContinuityDatabase,
} from '../../data/repositories/encryptedRepository';
import { benefitRecordSchema } from '../insurance/InsuranceBenefits';
import { employmentSchema } from '../business/BusinessEmployment';
import { financialAccountSchema } from '../finance/FinanceAccounts';
import { propertyAssetSchema } from '../property/PropertyAssets';
import { obligationSchema } from '../debts/DebtsObligations';
import { legalRecordSchema } from '../legal/LegalEstate';

const base = {
  id: z.string(),
  schemaVersion: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
};
export const reviewStateSchema = z.object({
  ...base,
  section: z.string(),
  status: z.enum([
    'notStarted',
    'inProgress',
    'reviewed',
    'changed',
    'notApplicable',
  ]),
  lastReviewed: z.string().optional(),
  reason: z.string().optional(),
});
const opaqueSchema = z.object({ ...base }).passthrough();
type ReviewState = z.infer<typeof reviewStateSchema>;
type Gap = string;
type Section = { key: string; path: string; gaps: Gap[] };
const sections: Section[] = [
  { key: 'immediate', path: 'start-here', gaps: ['noNotify'] },
  { key: 'people', path: 'people-contacts', gaps: [] },
  { key: 'legal', path: 'legal-estate', gaps: [] },
  {
    key: 'money',
    path: 'money-benefits',
    gaps: ['insuranceBeneficiary', 'noBackup'],
  },
  { key: 'property', path: 'property', gaps: ['propertyInsurance'] },
  { key: 'digital', path: 'digital-access', gaps: [] },
  { key: 'family', path: 'family-continuity', gaps: [] },
  { key: 'tax', path: 'tax-records', gaps: [] },
  { key: 'wishes', path: 'wishes-legacy', gaps: [] },
];

export function CompletenessReview({
  database,
  dek,
}: {
  database: ContinuityDatabase | null;
  dek: CryptoKey;
}) {
  const { t } = useTranslation('review');
  const [states, setStates] = useState<Record<string, ReviewState>>({});
  const [gaps, setGaps] = useState<Record<string, Gap[]>>({});
  const [saved, setSaved] = useState(false);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(
        database,
        dek,
        'ReviewState',
        reviewStateSchema,
      ).list(),
      database.encryptedRecords.toArray(),
    ]).then(([items, envelopes]) => {
      const latestData = envelopes
        .filter((item) => item.entityType !== 'ReviewState')
        .reduce(
          (latest, item) => (item.updatedAt > latest ? item.updatedAt : latest),
          '',
        );
      setStates(
        Object.fromEntries(
          items.map((item) => [
            item.section,
            latestData > item.updatedAt && item.status === 'reviewed'
              ? { ...item, status: 'changed' as const }
              : item,
          ]),
        ),
      );
    });
    const loadGaps = async () => {
      const [
        benefits,
        employments,
        accounts,
        properties,
        obligations,
        contacts,
        legalRecords,
      ] = await Promise.all([
        createEncryptedRepository(
          database,
          dek,
          'BenefitRecord',
          benefitRecordSchema,
        ).list(),
        createEncryptedRepository(
          database,
          dek,
          'EmploymentRecord',
          employmentSchema,
        ).list(),
        createEncryptedRepository(
          database,
          dek,
          'FinancialAccount',
          financialAccountSchema,
        ).list(),
        createEncryptedRepository(
          database,
          dek,
          'PropertyAsset',
          propertyAssetSchema,
        ).list(),
        createEncryptedRepository(
          database,
          dek,
          'HouseholdObligation',
          obligationSchema,
        ).list(),
        createEncryptedRepository(
          database,
          dek,
          'Contact',
          opaqueSchema,
        ).list(),
        createEncryptedRepository(
          database,
          dek,
          'LegalRecord',
          legalRecordSchema,
        ).list(),
      ]);
      const next: Record<string, Gap[]> = {};
      if (contacts.length === 0) next.immediate = ['noNotify'];
      if (
        legalRecords.some(
          (item) =>
            ['will', 'trust'].includes(item.kind) && !item.originalLocationId,
        )
      )
        next.legal = ['missingOriginal'];
      if (benefits.some((item) => !item.beneficiarySummary))
        next.money = ['insuranceBeneficiary'];
      if (employments.length > 0 && contacts.length === 0)
        next.people = ['employmentContact'];
      if (properties.some((item) => !item.insurance))
        next.property = ['propertyInsurance'];
      if (
        obligations.some(
          (item) => item.criticality === 'critical' && !item.paidFrom,
        )
      )
        next.money = [...(next.money ?? []), 'billSource'];
      if (!window.localStorage.getItem('continuity-binder-last-backup-at'))
        next.money = [...(next.money ?? []), 'noBackup'];
      void accounts;
      setGaps(next);
    };
    void loadGaps();
  }, [database, dek]);
  const mark = async (
    section: Section,
    status: ReviewState['status'],
    reason = '',
  ) => {
    if (!database) return;
    const now = new Date().toISOString();
    const next: ReviewState = {
      id: states[section.key]?.id ?? crypto.randomUUID(),
      schemaVersion: 1,
      createdAt: states[section.key]?.createdAt ?? now,
      updatedAt: now,
      section: section.key,
      status,
      lastReviewed:
        status === 'reviewed' ? now : states[section.key]?.lastReviewed,
      reason: reason || states[section.key]?.reason,
    };
    await createEncryptedRepository(
      database,
      dek,
      'ReviewState',
      reviewStateSchema,
    ).put(next);
    setStates((current) => ({ ...current, [section.key]: next }));
    setSaved(true);
  };
  const included = sections.filter(
    (section) => states[section.key]?.status !== 'notApplicable',
  );
  const reviewed = included.filter(
    (section) => states[section.key]?.status === 'reviewed',
  ).length;
  return (
    <section className="section-page">
      <p className="eyebrow">{t('title')}</p>
      <h2>{t('title')}</h2>
      <p>{t('percentage', { reviewed, total: included.length })}</p>
      {saved && <p role="status">{t('saved')}</p>}
      <div className="review-list">
        {sections.map((section) => {
          const state = states[section.key];
          const sectionGaps = gaps[section.key] ?? [];
          const status = state?.status ?? 'notStarted';
          return (
            <article className="section-card" key={section.key}>
              <h3>{t(`groups.${section.key}`)}</h3>
              <p>{t(status)}</p>
              {state?.lastReviewed && (
                <p>
                  {t('lastReviewed')}: {state.lastReviewed}
                </p>
              )}
              <h4>{t('missing')}</h4>
              {sectionGaps.length === 0 ? (
                <p>{t('noGaps')}</p>
              ) : (
                <ul>
                  {sectionGaps.map((gap) => (
                    <li key={gap}>
                      {t(`gaps.${gap}`, {
                        defaultValue:
                          gap === 'missingOriginal'
                            ? 'A will or trust record has no original document location.'
                            : undefined,
                      })}
                    </li>
                  ))}
                </ul>
              )}
              <label>
                {t('reason')}
                <input
                  value={reasons[section.key] ?? state?.reason ?? ''}
                  onChange={(event) =>
                    setReasons((current) => ({
                      ...current,
                      [section.key]: event.target.value,
                    }))
                  }
                />
              </label>
              <Link to={`/binder/${section.path}`}>{t('reviewSection')}</Link>
              <button
                type="button"
                onClick={() => void mark(section, 'reviewed')}
              >
                {t('markReviewed')}
              </button>
              <button
                type="button"
                onClick={() =>
                  void mark(section, 'notApplicable', reasons[section.key])
                }
              >
                {t('markNA')}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
