import Dexie, { type Table } from 'dexie';
import { z } from 'zod';
import type { VaultHeader } from '../../crypto/vault';

export type EncryptedEnvelope = { id: string; entityType: string; schemaVersion: number; iv: string; ciphertext: string; updatedAt: string };
export type VaultMetaRecord = { key: 'header'; header: VaultHeader };

export class ContinuityDatabase extends Dexie {
  vaultMeta!: Table<VaultMetaRecord, string>;
  encryptedRecords!: Table<EncryptedEnvelope, string>;
  migrationMeta!: Table<{ key: string; value: string }, string>;
  constructor(name = 'continuity-binder') { super(name); this.version(1).stores({ vault_meta: '&key', encrypted_records: '&id, entityType, schemaVersion, updatedAt', migration_meta: '&key' }); }
}

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)])) : value;
const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(stable(value)));
const aad = (id: string, entityType: string, schemaVersion: number) => new TextEncoder().encode(`${id}\0${entityType}\0${schemaVersion}`);

export interface EncryptedRepository<T> { get(id: string): Promise<T | null>; list(): Promise<T[]>; put(record: T): Promise<void>; delete(id: string): Promise<void>; }

export function createEncryptedRepository<T extends { id: string; schemaVersion: number; updatedAt: string }>(db: ContinuityDatabase, dek: CryptoKey, entityType: string, schema: z.ZodType<T>): EncryptedRepository<T> {
  return {
    async get(id) { const envelope = await db.encryptedRecords.get(id); if (!envelope || envelope.entityType !== entityType) return null; const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(envelope.iv), additionalData: aad(id, entityType, envelope.schemaVersion) }, dek, base64ToBytes(envelope.ciphertext)); return schema.parse(JSON.parse(new TextDecoder().decode(plaintext)) as unknown); },
    async list() { const envelopes = await db.encryptedRecords.where('entityType').equals(entityType).toArray(); return Promise.all(envelopes.map(async (envelope) => { const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(envelope.iv), additionalData: aad(envelope.id, entityType, envelope.schemaVersion) }, dek, base64ToBytes(envelope.ciphertext)); return schema.parse(JSON.parse(new TextDecoder().decode(plaintext)) as unknown); })); },
    async put(record) { const valid = schema.parse(record); const iv = crypto.getRandomValues(new Uint8Array(12)); const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(valid.id, entityType, valid.schemaVersion) }, dek, encode(valid)); await db.encryptedRecords.put({ id: valid.id, entityType, schemaVersion: valid.schemaVersion, iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)), updatedAt: valid.updatedAt }); },
    async delete(id) { await db.encryptedRecords.delete(id); },
  };
}

export async function putVaultHeader(db: ContinuityDatabase, header: VaultHeader) { await db.transaction('rw', db.vaultMeta, async () => { await db.vaultMeta.put({ key: 'header', header }); }); }
export async function getVaultHeader(db: ContinuityDatabase) { return (await db.vaultMeta.get('header'))?.header ?? null; }
export async function eraseVault(db: ContinuityDatabase) { await db.transaction('rw', [db.vaultMeta, db.encryptedRecords, db.migrationMeta], async () => { await Promise.all([db.vaultMeta.clear(), db.encryptedRecords.clear(), db.migrationMeta.clear()]); }); }
