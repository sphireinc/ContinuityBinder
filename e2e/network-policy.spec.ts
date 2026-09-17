import { expect, test } from '@playwright/test';

test('does not exfiltrate sensitive form sentinels after application load', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(`${request.url()} ${request.postData() ?? ''}`));
  await page.goto('/');
  await page.getByLabel('Language').selectOption('es');
  await page.getByLabel('Idioma').selectOption('en');
  await page.waitForTimeout(250);
  const appOrigin = new URL(page.url()).origin;
  expect(requests.filter((request) => !request.startsWith(appOrigin))).toEqual([]);
  expect(requests.join('\n')).not.toContain('continuity-sensitive-sentinel');
});
