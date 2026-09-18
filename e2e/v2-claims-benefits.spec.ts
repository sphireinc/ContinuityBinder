import { expect, test } from '@playwright/test';

test('prepares a claims and benefits record with blank survivor actions', async ({ page }) => {
  await page.goto('/binder/setup');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin binder setup' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await page.getByRole('link', { name: 'Claims & Benefits Tracker' }).click();
  await expect(page.getByText(/No claims & benefits tracker records/i)).toBeVisible();
  await page.getByLabel('Benefit/policy').fill('Synthetic life policy');
  await page.getByLabel('Carrier/administrator').fill('Synthetic carrier');
  await page.getByLabel('Claim contact').fill('Synthetic contact');
  await page.getByRole('button', { name: 'Save claim locally' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await expect(page.getByText('Synthetic life policy — Synthetic carrier')).toBeVisible();
  await expect(page.getByText(/Claim opened.*Documents supplied.*Approved.*Paid.*Closed/)).toBeVisible();
});
