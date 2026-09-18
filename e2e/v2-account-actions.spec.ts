import { expect, test } from '@playwright/test';

test('prepares an account action with blank survivor paper controls', async ({ page }) => {
  await page.goto('/binder/setup');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin binder setup' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await page.getByRole('link', { name: 'Account Closure / Transfer Tracker' }).click();
  await expect(page.getByText(/No account closure \/ transfer tracker records/i)).toBeVisible();
  await page.getByLabel('Account reference').fill('Synthetic checking account');
  await page.getByLabel('Institution/provider').fill('Synthetic bank');
  await page.getByLabel('Recommended action').fill('Review');
  await page.getByRole('button', { name: 'Save account action locally' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await expect(page.getByText('Synthetic checking account — Synthetic bank')).toBeVisible();
  await expect(page.getByText(/Leave active.*Transfer.*Close.*Review.*Other/)).toBeVisible();
});
