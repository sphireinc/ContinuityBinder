import { DATA_SCHEMA_VERSION } from '../constants';
import type { ContinuityDatabase } from './repositories/encryptedRepository';

const VERSION_KEY = 'domain-data-schema-version';
export async function getStoredDataSchemaVersion(database: ContinuityDatabase) { return Number((await database.migrationMeta.get(VERSION_KEY))?.value ?? 0); }

export async function migrateAfterUnlock(database: ContinuityDatabase) {
  const stored = await getStoredDataSchemaVersion(database);
  if (stored > DATA_SCHEMA_VERSION) throw new Error(`This binder uses a newer data schema (${stored}).`);
  if (stored === DATA_SCHEMA_VERSION) return { migrated: false, from: stored, to: stored };
  await database.transaction('rw', database.migrationMeta, async () => {
    await database.migrationMeta.put({ key: VERSION_KEY, value: String(DATA_SCHEMA_VERSION) });
  });
  return { migrated: true, from: stored, to: DATA_SCHEMA_VERSION };
}
