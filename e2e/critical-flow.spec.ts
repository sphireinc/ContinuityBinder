import { expect, test } from '@playwright/test';

test('sets up a household, locks, and unlocks the binder', async ({ page }) => {
  await page.goto('/binder/setup');
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
});
