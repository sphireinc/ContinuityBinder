import { VAULT_FORMAT_VERSION } from '../constants';

export type VaultHeader = { vaultFormatVersion: number; kdf: 'PBKDF2-HMAC-SHA-256'; iterations: number; salt: string; wrapIv: string; wrappedDek: string; createdAt: string; updatedAt: string };
const encoder = new TextEncoder();
const ITERATIONS = 310_000;
const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
async function keyFromPassphrase(passphrase: string, salt: Uint8Array, iterations: number) { const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']); return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['wrapKey', 'unwrapKey']); }

export async function createVault(passphrase: string): Promise<{ header: VaultHeader; dek: CryptoKey }> {
  const salt = crypto.getRandomValues(new Uint8Array(16)); const wrapIv = crypto.getRandomValues(new Uint8Array(12));
  const dek = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']); const kek = await keyFromPassphrase(passphrase, salt, ITERATIONS);
  const wrappedDek = await crypto.subtle.wrapKey('raw', dek, kek, { name: 'AES-GCM', iv: wrapIv }); const now = new Date().toISOString();
  return { dek, header: { vaultFormatVersion: VAULT_FORMAT_VERSION, kdf: 'PBKDF2-HMAC-SHA-256', iterations: ITERATIONS, salt: bytesToBase64(salt), wrapIv: bytesToBase64(wrapIv), wrappedDek: bytesToBase64(new Uint8Array(wrappedDek)), createdAt: now, updatedAt: now } };
}

export async function unlockVault(passphrase: string, header: VaultHeader): Promise<CryptoKey> {
  const kek = await keyFromPassphrase(passphrase, base64ToBytes(header.salt), header.iterations);
  return crypto.subtle.unwrapKey('raw', base64ToBytes(header.wrappedDek), kek, { name: 'AES-GCM', iv: base64ToBytes(header.wrapIv) }, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function changeVaultPassphrase(dek: CryptoKey, passphrase: string, previous: VaultHeader): Promise<VaultHeader> {
  const salt = crypto.getRandomValues(new Uint8Array(16)); const wrapIv = crypto.getRandomValues(new Uint8Array(12)); const kek = await keyFromPassphrase(passphrase, salt, previous.iterations);
  const wrappedDek = await crypto.subtle.wrapKey('raw', dek, kek, { name: 'AES-GCM', iv: wrapIv });
  return { ...previous, salt: bytesToBase64(salt), wrapIv: bytesToBase64(wrapIv), wrappedDek: bytesToBase64(new Uint8Array(wrappedDek)), updatedAt: new Date().toISOString() };
}
