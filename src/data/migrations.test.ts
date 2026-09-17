import { describe, expect, it } from 'vitest';
import { migrateAfterUnlock } from './migrations';

describe('data schema migrations', () => {
  it('migrates an empty prior fixture to the current schema atomically', async () => {
    const metadata = new Map<string, { key: string; value: string }>();
    const database = { migrationMeta: { get: async (key: string) => metadata.get(key), put: async (value: { key: string; value: string }) => { metadata.set(value.key, value); } }, transaction: async (_mode: string, _table: unknown, callback: () => Promise<void>) => callback() } as never;
    await expect(migrateAfterUnlock(database)).resolves.toEqual({ migrated: true, from: 0, to: 1 });
    await expect(migrateAfterUnlock(database)).resolves.toEqual({ migrated: false, from: 1, to: 1 });
  });

  it('rejects a future schema without changing migration metadata', async () => {
    const metadata = new Map([['domain-data-schema-version', { key: 'domain-data-schema-version', value: '99' }]]);
    const database = { migrationMeta: { get: async (key: string) => metadata.get(key), put: async () => { throw new Error('must not write'); } }, transaction: async () => { throw new Error('must not transact'); } } as never;
    await expect(migrateAfterUnlock(database)).rejects.toThrow('newer data schema');
    expect(metadata.get('domain-data-schema-version')?.value).toBe('99');
  });
});
