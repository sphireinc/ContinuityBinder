import JSZip from 'jszip';
import { z } from 'zod';
import { getVaultHeader, type ContinuityDatabase, type EncryptedEnvelope } from '../data/repositories/encryptedRepository';
import type { VaultHeader } from '../crypto/vault';

const FORMAT_VERSION = 1;
const encoder = new TextEncoder();
const vaultHeaderSchema = z.object({ vaultFormatVersion: z.number(), kdf: z.literal('PBKDF2-HMAC-SHA-256'), iterations: z.number().int().min(310_000), salt: z.string(), wrapIv: z.string(), wrappedDek: z.string(), createdAt: z.string(), updatedAt: z.string() });
const envelopeSchema = z.object({ id: z.string(), entityType: z.string(), schemaVersion: z.number().int(), iv: z.string(), ciphertext: z.string(), updatedAt: z.string() });
const manifestSchema = z.object({ backupFormatVersion: z.literal(FORMAT_VERSION), createdAt: z.string(), files: z.record(z.string().regex(/^[a-f0-9]{64}$/)) });
const files = ['vault-header.json', 'encrypted-records.json', 'migration-meta.json', 'settings.json'] as const;
export type BackupSettings = Record<string, string | number | boolean | null>;
export type BackupManifest = z.infer<typeof manifestSchema>;

async function digest(value: string) { const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(value)); return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }
function json(value: unknown) { return JSON.stringify(value, null, 2); }

export async function createEncryptedBackup(database: ContinuityDatabase, settings: BackupSettings = {}) {
  const header = await getVaultHeader(database);
  if (!header) throw new Error('Cannot create a backup before the vault has been initialized.');
  const [records, migrationMeta] = await Promise.all([database.encryptedRecords.toArray(), database.migrationMeta.toArray()]);
  const contents: Record<string, string> = {
    'vault-header.json': json(header),
    'encrypted-records.json': json(records),
    'migration-meta.json': json(migrationMeta),
    'settings.json': json(settings),
  };
  const manifest: BackupManifest = { backupFormatVersion: FORMAT_VERSION, createdAt: new Date().toISOString(), files: {} };
  for (const file of files) manifest.files[file] = await digest(contents[file]);
  const zip = new JSZip();
  zip.file('manifest.json', json(manifest));
  for (const file of files) zip.file(file, contents[file]);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  window.localStorage.setItem('continuity-binder-last-backup-at', manifest.createdAt);
  window.localStorage.setItem('continuity-binder-backup-format-version', String(FORMAT_VERSION));
  return { blob, manifest };
}

export async function validateEncryptedBackup(blob: Parameters<typeof JSZip.loadAsync>[0]) {
  try {
    const zip = await JSZip.loadAsync(blob);
    const manifest = manifestSchema.parse(JSON.parse(await zip.file('manifest.json')!.async('text')) as unknown);
    for (const file of files) {
      const entry = zip.file(file);
      if (!entry || manifest.files[file] !== await digest(await entry.async('text'))) throw new Error(`Invalid backup checksum: ${file}`);
    }
    vaultHeaderSchema.parse(JSON.parse(await zip.file('vault-header.json')!.async('text')) as unknown);
    z.array(envelopeSchema).parse(JSON.parse(await zip.file('encrypted-records.json')!.async('text')) as unknown);
    z.array(z.object({ key: z.string(), value: z.string() })).parse(JSON.parse(await zip.file('migration-meta.json')!.async('text')) as unknown);
    z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).parse(JSON.parse(await zip.file('settings.json')!.async('text')) as unknown);
    return manifest;
  } catch (error) {
    throw new Error('Invalid encrypted backup structure or checksum.', { cause: error });
  }
}

export type { EncryptedEnvelope, VaultHeader };
