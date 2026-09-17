import { describe, expect, it } from 'vitest';
import { changeVaultPassphrase, createVault, unlockVault } from './vault';

describe('vault cryptography', () => {
  it('creates a wrapped DEK and unlocks it only with the correct passphrase', async () => {
    const created = await createVault('a deliberately long passphrase');
    expect(created.header.iterations).toBeGreaterThanOrEqual(310_000);
    expect(created.header.salt).not.toBe('');
    await expect(unlockVault('wrong passphrase', created.header)).rejects.toThrow();
    const unlocked = await unlockVault('a deliberately long passphrase', created.header);
    expect(unlocked.type).toBe('secret');
  });

  it('rewraps the same in-memory DEK with a new passphrase', async () => {
    const created = await createVault('a deliberately long passphrase');
    const changed = await changeVaultPassphrase(created.dek, 'an entirely new passphrase', created.header);
    await expect(unlockVault('a deliberately long passphrase', changed)).rejects.toThrow();
    await expect(unlockVault('an entirely new passphrase', changed)).resolves.toBeTruthy();
  });

  it('rewraps a DEK obtained by unlocking the vault', async () => {
    const created = await createVault('a deliberately long passphrase');
    const unlocked = await unlockVault('a deliberately long passphrase', created.header);
    const changed = await changeVaultPassphrase(unlocked, 'an entirely new passphrase', created.header);
    await expect(unlockVault('an entirely new passphrase', changed)).resolves.toBeTruthy();
  });
});
