import { expect, test } from '@playwright/test';

test('gates all binder setup introduction pages with a fresh five-second timer', async ({ page }) => {
  await page.goto('/binder/setup');

  let button = page.getByRole('button', { name: '5...' });
  await expect(button).toBeDisabled();
  await expect(page.getByRole('button', { name: /skip/i })).toHaveCount(0);
  await page.waitForTimeout(1050);
  await expect(page.getByRole('button', { name: '4...' })).toBeDisabled();
  await page.waitForTimeout(4050);
  button = page.getByRole('button', { name: 'Continue' });
  await expect(button).toBeEnabled();
  await button.click();

  button = page.getByRole('button', { name: '5...' });
  await expect(button).toBeDisabled();
  await expect(page.getByRole('button', { name: /skip/i })).toHaveCount(0);
  await page.waitForTimeout(5050);
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
  await page.getByRole('button', { name: 'Continue' }).click();

  button = page.getByRole('button', { name: '5...' });
  await expect(button).toBeDisabled();
  await expect(page.getByRole('button', { name: /skip/i })).toHaveCount(0);
  await page.waitForTimeout(5050);
  button = page.getByRole('button', { name: 'Begin Binder Setup' });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByRole('heading', { name: 'Set up your binder' })).toBeVisible();
});
