import { expect, test } from '@playwright/test';

test('reopens the app offline after the first load', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await globalThis.navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /prepare the information your family will need/i })).toBeVisible();
});
