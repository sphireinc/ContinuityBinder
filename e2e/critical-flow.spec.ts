import { expect, test } from '@playwright/test';

test('sets up a household, locks, and unlocks the binder', async ({ page }) => {
  await page.goto('/binder/setup');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin binder setup' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await expect(page).toHaveURL(/\/binder\/overview$/);
  await page.getByRole('link', { name: 'Household setup' }).click();
  await page.getByLabel('Household display name').fill('Synthetic Household');
  await page.getByLabel('Primary adults').fill('Alex Example');
  await page.getByRole('button', { name: 'Save household setup' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await page.getByRole('button', { name: 'Lock' }).click();
  await expect(page).toHaveURL(/\/binder\/unlock$/);
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('button', { name: 'Unlock binder' }).click();
  await expect(page).toHaveURL(/\/binder\/overview$/);
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('textbox', { name: 'Current passphrase' }).first().fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'New passphrase', exact: true }).fill('a deliberately different passphrase');
  await page.getByRole('textbox', { name: 'Confirm new passphrase' }).fill('a deliberately different passphrase');
  await page.getByRole('button', { name: 'Change passphrase' }).last().click();
  await expect(page.getByRole('status')).toContainText('Passphrase changed locally');
  await page.getByRole('button', { name: 'Lock' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately different passphrase');
  await page.getByRole('button', { name: 'Unlock binder' }).click();
  await expect(page).toHaveURL(/\/binder\/overview$/);
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByText('Before erasing, make an encrypted backup if you may need this binder again.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Current passphrase' }).last().fill('a deliberately different passphrase');
  await page.getByRole('textbox', { name: 'Type ERASE to confirm' }).fill('ERASE');
  await page.getByRole('button', { name: 'Erase local binder' }).click();
  await expect(page).toHaveURL(/\/$|\/\?erased=1$/);
  await expect(page.getByRole('status')).toContainText('local binder was erased');
  await expect.poll(async () => page.evaluate(() => new Promise<boolean>((resolve) => {
    const request = window.indexedDB.open('continuity-binder');
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction('vault_meta', 'readonly');
      const get = transaction.objectStore('vault_meta').get('header');
      get.onsuccess = () => { resolve(get.result === undefined); database.close(); };
      get.onerror = () => { resolve(true); database.close(); };
    };
    request.onerror = () => resolve(true);
  }))).toBe(true);
});

test('supports keyboard-only setup and lock/unlock controls', async ({ page }) => {
  await page.goto('/binder/setup');
  for (let step = 0; step < 2; step += 1) {
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await continueButton.focus();
    await page.keyboard.press('Enter');
  }
  const beginButton = page.getByRole('button', { name: 'Begin binder setup' });
  await beginButton.focus();
  await page.keyboard.press('Enter');

  const passphrase = page.getByRole('textbox', { name: 'Passphrase', exact: true });
  const confirmation = page.getByRole('textbox', { name: 'Confirm passphrase' });
  await passphrase.focus();
  await page.keyboard.type('a deliberately long passphrase');
  await confirmation.focus();
  await page.keyboard.type('a deliberately long passphrase');
  const acknowledgment = page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' });
  await acknowledgment.focus();
  await page.keyboard.press('Space');
  const createButton = page.getByRole('button', { name: 'Create encrypted binder' });
  await createButton.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/binder\/overview$/);

  const lockButton = page.getByRole('button', { name: 'Lock' });
  await lockButton.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/binder\/unlock$/);
  const unlockPassphrase = page.getByRole('textbox', { name: 'Passphrase', exact: true });
  await unlockPassphrase.focus();
  await page.keyboard.type('a deliberately long passphrase');
  const unlockButton = page.getByRole('button', { name: 'Unlock binder' });
  await unlockButton.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/binder\/overview$/);
});
