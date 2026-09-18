import { expect, test } from '@playwright/test';

test('prepares an estate administration task using a canonical person', async ({ page }) => {
  await page.goto('/binder/setup');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin binder setup' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await page.getByRole('link', { name: 'Household Setup' }).click();
  await page.getByLabel('Household display name').fill('Synthetic Household');
  await page.getByLabel('Primary adults').fill('Alex Example');
  await page.getByRole('button', { name: 'Save household setup' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await page.getByRole('link', { name: 'Estate Administration Tracker' }).click();
  await expect(page.getByText(/No estate administration tracker records/i)).toBeVisible();
  await page.getByLabel('Deceased person').selectOption({ label: 'Alex Example' });
  await page.getByLabel('Task').fill('Locate signed records');
  await page.getByLabel('Court/agency').fill('Synthetic probate office');
  await page.getByRole('button', { name: 'Save task locally' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await expect(page.getByText('Alex Example — Locate signed records')).toBeVisible();
  await expect(page.getByText(/Not started.*In progress.*Completed.*N\/A/)).toBeVisible();
});
