import { expect, test } from '@playwright/test';

test('tracks death-certificate copies using a canonical person', async ({ page }) => {
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
  await page.getByRole('link', { name: 'Death Certificate Tracker' }).click();
  await expect(page.getByText(/No death certificate tracker records/i)).toBeVisible();
  await page.getByLabel('Deceased person').selectOption({ label: 'Alex Example' });
  await page.getByLabel('Copies ordered').fill('4');
  await page.getByLabel('Institution').fill('Synthetic insurer');
  await page.getByLabel('Copy sent').fill('Synthetic insurer');
  await page.getByRole('button', { name: 'Save record locally' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  await expect(page.getByText('Alex Example — 4')).toBeVisible();
  await expect(page.getByText(/Sent.*Returned.*No return expected/)).toBeVisible();
  await page.getByRole('link', { name: 'Binder Preview' }).click();
  await expect(page.getByText('Alex Example: 4')).toBeVisible();
});
