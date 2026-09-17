import { expect, test } from '@playwright/test';

async function createBinder(page: import('@playwright/test').Page) {
  await page.goto('/binder/setup');
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await expect(page).toHaveURL(/\/binder\/overview$/);
}

test('renders masked print preview and downloads a readable archive only after confirmation', async ({ page }) => {
  await createBinder(page);
  await page.getByRole('link', { name: 'Binder preview' }).click();
  await expect(page.getByRole('heading', { name: 'Export choices' })).toBeVisible();
  await expect(page.getByLabel('Identifiers')).toHaveValue('last4');
  await page.getByRole('button', { name: 'Print / Save PDF' }).click();
  await page.getByRole('link', { name: 'Export archive' }).click();
  const downloadButton = page.getByRole('button', { name: 'Export readable archive (.zip)' });
  await expect(downloadButton).toBeDisabled();
  await page.getByRole('checkbox', { name: 'I understand this archive is readable without my passphrase.' }).check();
  const download = page.waitForEvent('download');
  await downloadButton.click();
  expect((await download).suggestedFilename()).toMatch(/\.zip$/);
});
