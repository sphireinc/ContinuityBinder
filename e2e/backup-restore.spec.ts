import { expect, test } from '@playwright/test';

async function setup(page: import('@playwright/test').Page) {
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

test('restores an encrypted backup in a new browser context', async ({ browser }) => {
  const source = await browser.newContext();
  const sourcePage = await source.newPage();
  await setup(sourcePage);
  await sourcePage.getByRole('link', { name: 'Backup & Restore' }).click();
  await sourcePage.getByRole('checkbox', { name: /This backup remains encrypted/i }).check();
  const downloadEvent = sourcePage.waitForEvent('download');
  await sourcePage.getByRole('button', { name: 'Create encrypted backup' }).click();
  const backupPath = await (await downloadEvent).path();
  expect(backupPath).toBeTruthy();

  const destination = await browser.newContext();
  const destinationPage = await destination.newPage();
  await destinationPage.goto('/binder/backup-restore');
  await destinationPage.locator('input[type="file"]').setInputFiles(backupPath!);
  await expect(destinationPage.getByRole('status')).toContainText('Backup structure and checksums are valid');
  await destinationPage.getByRole('textbox', { name: 'Backup passphrase' }).fill('a deliberately long passphrase');
  await destinationPage.getByRole('textbox', { name: /Type REPLACE/i }).fill('REPLACE');
  await destinationPage.getByRole('button', { name: 'Replace current local binder' }).click();
  await expect(destinationPage.getByRole('status')).toContainText('Encrypted backup restored locally');
  await source.close();
  await destinationPage.goto('/binder/unlock');
  await destinationPage.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await destinationPage.getByRole('button', { name: 'Unlock binder' }).click();
  await expect(destinationPage).toHaveURL(/\/binder\/overview$/);
  await destination.close();
});
