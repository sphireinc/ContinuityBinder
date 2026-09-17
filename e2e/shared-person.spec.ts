import { expect, test } from '@playwright/test';

async function createBinder(page: import('@playwright/test').Page) {
  await page.goto('/binder/setup');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin binder setup' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await expect(page).toHaveURL(/\/binder\/overview$/);
}

test('reuses one household person in banking and benefits records', async ({ page }) => {
  await createBinder(page);
  await page.getByRole('link', { name: 'Household Setup' }).click();
  await page.getByLabel('Household display name').fill('Synthetic Household');
  await page.getByLabel('Primary adults').fill('Alex Example');
  await page.getByRole('button', { name: 'Save household setup' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');

  await page.getByRole('link', { name: 'Banking, Investments & Retirement' }).click();
  await page.getByLabel('Owners').selectOption({ label: 'Alex Example' });
  await page.getByLabel('Institution').fill('Synthetic Bank');
  await page.getByLabel('Identifier').fill('account-reference');
  await page.getByRole('button', { name: 'Save locally' }).click();
  await expect(page.getByRole('cell', { name: 'Alex Example', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Money & Benefits' }).click();
  await page.getByLabel('Insured').selectOption({ label: 'Alex Example' });
  await page.getByLabel('Carrier').fill('Synthetic Insurance');
  await page.getByLabel('Policy identifier').fill('policy-reference');
  await page.getByLabel('Benefit').fill('Synthetic benefit');
  await page.getByLabel('Beneficiary summary or label').fill('Alex Example household beneficiary');
  await page.getByRole('button', { name: 'Save locally' }).click();
  await expect(page.getByRole('cell', { name: 'Alex Example', exact: true })).toBeVisible();
});
