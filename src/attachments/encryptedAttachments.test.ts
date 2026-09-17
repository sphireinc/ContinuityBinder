import { describe, expect, it } from 'vitest';
import { createVault } from '../crypto/vault';
import { getDecryptedAttachment, putEncryptedAttachment } from './encryptedAttachments';

describe('encrypted local attachments', () => {
  it('stores ciphertext and decrypts supported bytes with the DEK', async () => {
    const { dek } = await createVault('a deliberately long passphrase');
    let stored: Record<string, unknown> | undefined;
    const database = { attachments: { put: async (value: Record<string, unknown>) => { stored = value; }, get: async () => stored } } as never;
    const bytes = new TextEncoder().encode('private attachment text');
    const id = await putEncryptedAttachment(database, dek, { filename: 'notes.txt', mimeType: 'text/plain', bytes });
    expect(id).toBe(stored?.id);
    expect(stored?.ciphertext).not.toContain('private attachment text');
    const restored = await getDecryptedAttachment(database, dek, id);
    expect(restored).toMatchObject({ filename: 'notes.txt', mimeType: 'text/plain' });
    expect([...restored!.bytes]).toEqual([...bytes]);
  });

  it('rejects active content and files over the size limit', async () => {
    const { dek } = await createVault('a deliberately long passphrase');
    const database = { attachments: { put: async () => undefined } } as never;
    await expect(putEncryptedAttachment(database, dek, { filename: 'page.svg', mimeType: 'image/svg+xml', bytes: new Uint8Array() })).rejects.toThrow('Only PDF');
    await expect(putEncryptedAttachment(database, dek, { filename: 'large.txt', mimeType: 'text/plain', bytes: new Uint8Array(10 * 1024 * 1024 + 1) })).rejects.toThrow('10 MB');
  });
});
