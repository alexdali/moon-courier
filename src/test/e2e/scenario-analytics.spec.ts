import { expect, test } from '@playwright/test';

test('scenario architect and analytics pages are reachable', async ({ page }) => {
  await page.goto('/scenario');
  await page
    .getByRole('group', { name: 'Язык' })
    .getByRole('button', { name: 'EN', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: /Generate worlds/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate scenario' })).toBeVisible();

  await page.goto('/analytics');
  await expect(page.getByRole('heading', { name: /Evidence before explanation/i })).toBeVisible();
  await expect(page.getByText('Total credits', { exact: true })).toBeVisible();
});

test('mission debrief exposes developer history and a page-wide theme switch', async ({ page }) => {
  await page.goto('/analytics');

  await expect(page.getByRole('tab', { name: 'Режим разработчика' })).toBeVisible();
  await page.getByRole('tab', { name: 'Режим разработчика' }).click();
  await expect(page.getByRole('heading', { name: 'Журнал запросов OpenRouter' })).toBeVisible();
  await expect(page.getByText('Токены из кэша', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Тёмная', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mission-theme', 'dark');
  await page.getByRole('button', { name: 'Светлая', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mission-theme', 'light');

  await page
    .getByRole('group', { name: 'Язык' })
    .getByRole('button', { name: 'EN', exact: true })
    .click();
  await expect(page.getByRole('tab', { name: 'Developer mode' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'OpenRouter request log' })).toBeVisible();
});
