import { expect, test } from '@playwright/test';
import { statSync } from 'node:fs';

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

  await page.getByRole('link', { name: 'Binder Preview' }).click();
  const accountSection = page.locator('.binder-section-accountClosureTransfer');
  await expect(accountSection).toContainText('Account Closure / Transfer Tracker');
  await expect(accountSection).toContainText('☐ Leave active');
  await expect(accountSection.locator('.page-break')).toHaveCount(1);

  await page.emulateMedia({ media: 'print' });
  const letterBox = await accountSection.boundingBox();
  expect(letterBox).not.toBeNull();
  expect(letterBox!.x + letterBox!.width).toBeLessThanOrEqual(1280);
  const letterPdf = test.info().outputPath('account-actions-letter.pdf');
  await page.pdf({ format: 'Letter', printBackground: true, path: letterPdf });
  expect(statSync(letterPdf).size).toBeGreaterThan(0);

  await page.emulateMedia({ media: 'screen' });
  await page.getByLabel('Page size').selectOption('a4');
  await page.emulateMedia({ media: 'print' });
  const a4Box = await accountSection.boundingBox();
  expect(a4Box).not.toBeNull();
  expect(a4Box!.x + a4Box!.width).toBeLessThanOrEqual(1280);
  const a4Pdf = test.info().outputPath('account-actions-a4.pdf');
  await page.pdf({ format: 'A4', printBackground: true, path: a4Pdf });
  expect(statSync(a4Pdf).size).toBeGreaterThan(0);
});
