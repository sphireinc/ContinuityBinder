import { z } from 'zod';
import type { ContinuityDatabase, EncryptedAttachment } from '../data/repositories/encryptedRepository';

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const SUPPORTED_ATTACHMENT_TYPES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
const schema = z.object({ id: z.string(), filename: z.string().min(1), mimeType: z.enum(SUPPORTED_ATTACHMENT_TYPES), size: z.number().int().nonnegative().max(MAX_ATTACHMENT_BYTES), iv: z.string(), ciphertext: z.string(), createdAt: z.string(), updatedAt: z.string() });
const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

export async function putEncryptedAttachment(database: ContinuityDatabase, dek: CryptoKey, input: { id?: string; filename: string; mimeType: string; bytes: ArrayBuffer | Uint8Array }) {
  if (!SUPPORTED_ATTACHMENT_TYPES.includes(input.mimeType as typeof SUPPORTED_ATTACHMENT_TYPES[number])) throw new Error('Only PDF, image, and plain-text attachments are supported.');
  const bytes = input.bytes instanceof Uint8Array ? input.bytes : new Uint8Array(input.bytes);
  if (bytes.byteLength > MAX_ATTACHMENT_BYTES) throw new Error('Attachments must be 10 MB or smaller.');
  const now = new Date().toISOString(); const iv = crypto.getRandomValues(new Uint8Array(12));
  const record: EncryptedAttachment = { id: input.id ?? crypto.randomUUID(), filename: input.filename, mimeType: input.mimeType, size: bytes.byteLength, iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dek, bytes as unknown as BufferSource))), createdAt: now, updatedAt: now };
  await database.attachments.put(schema.parse(record));
  return record.id;
}

export async function getDecryptedAttachment(database: ContinuityDatabase, dek: CryptoKey, id: string) {
  const record = await database.attachments.get(id); if (!record) return null;
  const valid = schema.parse(record); const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(valid.iv) }, dek, base64ToBytes(valid.ciphertext));
  return { ...valid, bytes: new Uint8Array(bytes) };
}
