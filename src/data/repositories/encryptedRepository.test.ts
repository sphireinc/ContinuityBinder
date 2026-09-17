import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createVault } from '../../crypto/vault';
import { createEncryptedRepository, type ContinuityDatabase, type EncryptedEnvelope } from './encryptedRepository';
import { contactSchema } from '../../features/contacts/PeopleContacts';

class MemoryTable {
  records = new Map<string, EncryptedEnvelope>();
  async get(id: string) { return this.records.get(id); }
  async put(record: EncryptedEnvelope) { this.records.set(record.id, record); }
  async delete(id: string) { this.records.delete(id); }
  where() { return { equals: (entityType: string) => ({ toArray: async () => [...this.records.values()].filter((record) => record.entityType === entityType) }) }; }
}

const schema = z.object({ id: z.string(), schemaVersion: z.number(), updatedAt: z.string(), privateNote: z.string() });

describe('encrypted repository', () => {
  it('validates, encrypts, and decrypts records without plaintext envelopes', async () => {
    const { dek } = await createVault('a deliberately long passphrase');
    const table = new MemoryTable();
    const db = { encryptedRecords: table } as unknown as ContinuityDatabase;
    const repository = createEncryptedRepository(db, dek, 'TestRecord', schema);
    const record = { id: 'record-1', schemaVersion: 1, updatedAt: '2026-09-17T00:00:00.000Z', privateNote: 'A private household note' };
    await repository.put(record);
    const envelope = table.records.get(record.id);
    expect(envelope).toBeDefined();
    expect(JSON.stringify(envelope)).not.toContain(record.privateNote);
    await expect(repository.get(record.id)).resolves.toEqual(record);
    await expect(repository.list()).resolves.toEqual([record]);
  });

  it('rejects records that fail the entity schema before writing', async () => {
    const { dek } = await createVault('a deliberately long passphrase');
    const table = new MemoryTable();
    const db = { encryptedRecords: table } as unknown as ContinuityDatabase;
    const repository = createEncryptedRepository(db, dek, 'TestRecord', schema);
    await expect(repository.put({ id: 'bad', schemaVersion: 1, updatedAt: 'now', privateNote: 42 } as never)).rejects.toThrow();
    expect(table.records.size).toBe(0);
  });

  it('quarantines a corrupt envelope instead of presenting it as valid data', async () => {
    const { dek } = await createVault('a deliberately long passphrase');
    const table = new MemoryTable();
    const db = { encryptedRecords: table } as unknown as ContinuityDatabase;
    const repository = createEncryptedRepository(db, dek, 'TestRecord', schema);
    await repository.put({ id: 'corrupt', schemaVersion: 1, updatedAt: 'now', privateNote: 'secret' });
    table.records.get('corrupt')!.ciphertext = 'AA==';
    await expect(repository.list()).resolves.toEqual([]);
    expect(repository.getQuarantinedIds()).toEqual(['corrupt']);
  });

  it('keeps a shared Contact phone value consistent for every reference', async () => {
    const { dek } = await createVault('a deliberately long passphrase');
    const table = new MemoryTable();
    const db = { encryptedRecords: table } as unknown as ContinuityDatabase;
    const repository = createEncryptedRepository(db, dek, 'Contact', contactSchema);
    const base = { id: 'contact-1', schemaVersion: 1, createdAt: '2026-09-17T00:00:00.000Z', displayName: 'Executor', role: 'attorney' as const };
    await repository.put({ ...base, updatedAt: base.createdAt, phone: '555-0100' });
    await repository.put({ ...base, updatedAt: '2026-09-17T00:01:00.000Z', phone: '555-0111' });
    await expect(repository.get(base.id)).resolves.toMatchObject({ phone: '555-0111' });
    await expect(repository.list()).resolves.toEqual([expect.objectContaining({ id: base.id, phone: '555-0111' })]);
  });
});
