import Dexie, { type Table } from 'dexie';
import { z } from 'zod';
import type { VaultHeader } from '../../crypto/vault';

export type EncryptedEnvelope = { id: string; entityType: string; schemaVersion: number; iv: string; ciphertext: string; updatedAt: string };
export type VaultMetaRecord = { key: 'header'; header: VaultHeader };
export type EncryptedAttachment = { id: string; filename: string; mimeType: string; size: number; iv: string; ciphertext: string; createdAt: string; updatedAt: string };

export class ContinuityDatabase extends Dexie {
  vaultMeta!: Table<VaultMetaRecord, string>;
  encryptedRecords!: Table<EncryptedEnvelope, string>;
  migrationMeta!: Table<{ key: string; value: string }, string>;
  attachments!: Table<EncryptedAttachment, string>;
  constructor(name = 'continuity-binder') { super(name); this.version(1).stores({ vault_meta: '&key', encrypted_records: '&id, entityType, schemaVersion, updatedAt', migration_meta: '&key' }); this.version(2).stores({ vault_meta: '&key', encrypted_records: '&id, entityType, schemaVersion, updatedAt', migration_meta: '&key', attachments: '&id, mimeType, updatedAt' }); }
}

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)])) : value;
const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(stable(value)));
const aad = (id: string, entityType: string, schemaVersion: number) => new TextEncoder().encode(`${id}\0${entityType}\0${schemaVersion}`);

export interface EncryptedRepository<T> { get(id: string): Promise<T | null>; list(): Promise<T[]>; put(record: T): Promise<void>; delete(id: string): Promise<void>; }

export function createEncryptedRepository<T extends { id: string; schemaVersion: number; updatedAt: string }>(db: ContinuityDatabase, dek: CryptoKey, entityType: string, schema: z.ZodType<T>): EncryptedRepository<T> & { getQuarantinedIds(): string[] } {
  const quarantined = new Set<string>();
  const decrypt = async (envelope: EncryptedEnvelope) => {
    try {
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(envelope.iv), additionalData: aad(envelope.id, entityType, envelope.schemaVersion) }, dek, base64ToBytes(envelope.ciphertext));
      return schema.parse(JSON.parse(new TextDecoder().decode(plaintext)) as unknown);
    } catch (error) {
      quarantined.add(envelope.id);
      throw error;
    }
  };
  return {
    async get(id) { const envelope = await db.encryptedRecords.get(id); if (!envelope || envelope.entityType !== entityType) return null; return decrypt(envelope); },
    async list() { const envelopes = await db.encryptedRecords.where('entityType').equals(entityType).toArray(); const records: T[] = []; for (const envelope of envelopes) { try { records.push(await decrypt(envelope)); } catch { /* quarantined; callers must not treat the list as complete */ } } return records; },
    async put(record) { const valid = schema.parse(record); const iv = crypto.getRandomValues(new Uint8Array(12)); const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(valid.id, entityType, valid.schemaVersion) }, dek, encode(valid)); try { await db.encryptedRecords.put({ id: valid.id, entityType, schemaVersion: valid.schemaVersion, iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)), updatedAt: valid.updatedAt }); } catch (error) { if (error instanceof DOMException && error.name === 'QuotaExceededError') throw new Error('Local storage capacity reached. Export an encrypted backup or free device storage before continuing.'); throw error; } },
    async delete(id) { await db.encryptedRecords.delete(id); },
    getQuarantinedIds() { return [...quarantined]; },
  };
}

export async function putVaultHeader(db: ContinuityDatabase, header: VaultHeader) { await db.transaction('rw', db.vaultMeta, async () => { await db.vaultMeta.put({ key: 'header', header }); }); }
export async function getVaultHeader(db: ContinuityDatabase) { return (await db.vaultMeta.get('header'))?.header ?? null; }
export async function eraseVault(db: ContinuityDatabase) { await db.transaction('rw', [db.vaultMeta, db.encryptedRecords, db.migrationMeta, db.attachments], async () => { await Promise.all([db.vaultMeta.clear(), db.encryptedRecords.clear(), db.migrationMeta.clear(), db.attachments.clear()]); }); }
