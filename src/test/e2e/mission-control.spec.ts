import { expect, test } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/api/mission/reset');
});

test('shows the complete mission control surface and mandatory impossible order', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ЛУННЫЙ КУРЬЕР')).toBeVisible();
  await expect(page.getByText('ИИ центра управления')).toBeVisible();
  await page.getByRole('group', { name: 'Язык' }).getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByText('Mission Control AI')).toBeVisible();
  await page.getByRole('button', { name: /HAB-021/i }).click();
  await page.getByRole('button', { name: /ATLAS-1/i }).click();
  await expect(page.getByText('Dispatch impossible')).toBeVisible();
  await expect(page.getByText(/Payload exceeds capacity/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Launch delivery' })).toBeDisabled();
});

test('launches a feasible delivery and renders a persisted result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('group', { name: 'Язык' }).getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: /BIO-014/i }).click();
  await page.getByRole('button', { name: /SCOUT-2/i }).click();
  await expect(page.getByText(/Ready to dispatch|High-risk dispatch/)).toBeVisible();
  await page.getByRole('button', { name: 'Launch delivery' }).click();
  await expect(page.getByText(/^(DELIVERY COMPLETE|DELIVERY FAILED)$/)).toBeVisible({ timeout: 15_000 });
});

test('persists the Russian-English interface choice', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Заказы', { exact: false })).toBeVisible();
  await page.getByRole('group', { name: 'Язык' }).getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByText('Orders', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Orders', { exact: false })).toBeVisible();
  await page.getByRole('group', { name: 'Language' }).getByRole('button', { name: 'RU', exact: true }).click();
  await expect(page.getByText('Заказы', { exact: false })).toBeVisible();
});
