import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { createEncryptedBackup, validateEncryptedBackup } from './encryptedBackup';

describe('encrypted backup', () => {
  it('copies encrypted envelopes without exposing their contents', async () => {
    const header = { vaultFormatVersion: 1, kdf: 'PBKDF2-HMAC-SHA-256' as const, iterations: 310000, salt: 'salt', wrapIv: 'iv', wrappedDek: 'wrapped', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
    const envelope = { id: 'record-1', entityType: 'Person', schemaVersion: 1, iv: 'encrypted-iv', ciphertext: 'ciphertext-only', updatedAt: header.updatedAt };
    const database = { vaultMeta: { get: async () => ({ key: 'header', header }) }, encryptedRecords: { toArray: async () => [envelope] }, attachments: { toArray: async () => [] }, migrationMeta: { toArray: async () => [{ key: 'schema', value: '1' }] } } as never;
    const { blob } = await createEncryptedBackup(database, { locale: 'en' });
    const zip = await JSZip.loadAsync(blob);
    const records = await zip.file('encrypted-records.json')!.async('text');
    expect(JSON.parse(records)).toEqual([envelope]);
    expect(records).not.toContain('plaintext secret');
    await expect(validateEncryptedBackup(blob)).resolves.toMatchObject({ backupFormatVersion: 1, minimumSupportedAppVersion: '0.1.0' });
  });

  it('rejects a modified encrypted backup', async () => {
    const database = { vaultMeta: { get: async () => ({ key: 'header', header: { vaultFormatVersion: 1, kdf: 'PBKDF2-HMAC-SHA-256', iterations: 310000, salt: 'salt', wrapIv: 'iv', wrappedDek: 'wrapped', createdAt: 'now', updatedAt: 'now' } }) }, encryptedRecords: { toArray: async () => [] }, attachments: { toArray: async () => [] }, migrationMeta: { toArray: async () => [] } } as never;
    const { blob } = await createEncryptedBackup(database);
    const zip = await JSZip.loadAsync(blob);
    zip.file('encrypted-records.json', '[{"id":"tampered"}]');
    await expect(validateEncryptedBackup(await zip.generateAsync({ type: 'blob' }))).rejects.toThrow('Invalid encrypted backup');
  });
});
