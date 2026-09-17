import { expect, test } from '@playwright/test';

test('keeps the landing page usable at a mobile width in Spanish', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel('Language').selectOption('es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('link', { name: 'Completar mi binder de continuidad familiar' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('keeps the unlocked navigation within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/binder/setup');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin binder setup' }).click();
  await page.getByRole('textbox', { name: 'Passphrase', exact: true }).fill('a deliberately long passphrase');
  await page.getByRole('textbox', { name: 'Confirm passphrase' }).fill('a deliberately long passphrase');
  await page.getByRole('checkbox', { name: 'I understand that Continuity Binder cannot recover this passphrase.' }).check();
  await page.getByRole('button', { name: 'Create encrypted binder' }).click();
  await expect(page).toHaveURL(/\/binder\/overview$/);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
});
