import { expect, test } from '@playwright/test';

test('scenario architect and analytics pages are reachable', async ({ page }) => {
  await page.goto('/scenario');
  await page.getByRole('group', { name: 'Язык' }).getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Generate worlds/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate scenario' })).toBeVisible();

  await page.goto('/analytics');
  await expect(page.getByRole('heading', { name: /Evidence before explanation/i })).toBeVisible();
  await expect(page.getByText('Total credits', { exact: true })).toBeVisible();
});
