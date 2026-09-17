import { expect, test } from '@playwright/test';

test('prepares an incapacity continuity plan using a canonical person', async ({ page }) => {
  await page.goto('/binder/setup');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin binder setup' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await expect(page).toHaveURL(/\/binder\/overview$/);
  await page.getByRole('link', { name: 'Household Setup' }).click();
  await page.getByLabel('Household display name').fill('Synthetic Household');
  await page.getByLabel('Primary adults').fill('Alex Example');
  await page.getByRole('button', { name: 'Save household setup' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await page.getByRole('link', { name: 'Incapacity Continuity Plan' }).click();
  await expect(page.getByText(/No incapacity continuity plan records/i)).toBeVisible();
  await page.getByLabel('Applies to person').selectOption({ label: 'Alex Example' });
  await page.getByLabel('Trigger/condition description').fill('Synthetic incapacity condition');
  await page.getByLabel('Instructions').fill('Locate the signed documents and call the primary contact.');
  await page.getByRole('button', { name: 'Save plan locally' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await expect(page.getByText('Alex Example — Synthetic incapacity condition')).toBeVisible();
  await expect(page.getByText('☐ Authority confirmed')).toBeVisible();
});
