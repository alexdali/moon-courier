import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('/api/mission/reset');
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.removeItem('moon-courier-view-mode');
    window.localStorage.removeItem('moon-courier-theme');
  });
  await page.reload();
});

test('simple view keeps the first glance compact and reveals details on demand', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-mission-view', 'simple');
  await expect(page.locator('html')).toHaveAttribute('data-mission-theme', 'light');
  await expect(page.getByRole('group', { name: 'Версия интерфейса' }).getByRole('button', { name: 'Простая' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Цветовая тема' }).getByRole('button', { name: 'Светлая' })).toHaveAttribute('aria-pressed', 'true');

  const order = page.locator('.order-card').filter({ hasText: 'MED-017' });
  const rover = page.locator('.rover-card').filter({ hasText: 'ATLAS-1' });
  await expect(order.locator('.order-card__metrics > span')).toHaveCount(2);
  await expect(rover.locator('.rover-card__metrics--primary > span')).toHaveCount(2);
  await expect(page.locator('.map-footer')).toHaveCount(0);
  await expect(page.getByText('ИИ центра управления')).toBeHidden();

  await order.getByText('Подробнее').click();
  await expect(order).toContainText('Назначение');
  await rover.getByText('Подробнее').click();
  await expect(rover).toContainText('Скорость');
  await page.getByRole('button', { name: 'Показать детали карты' }).click();
  await expect(page.locator('.map-footer')).toBeVisible();

  const assistant = page.locator('.mission-simple-tools details').filter({ hasText: 'ИИ-помощник' });
  await assistant.locator('summary').click();
  await assistant.getByRole('button', { name: 'Рекомендовать' }).click();
  await expect(assistant.locator('.ai-response')).toBeVisible();
  await expect(assistant.locator('.ai-response')).toContainText('MED-017');
});

test('layout and theme switches support every combination and persist independently', async ({ page }) => {
  await page.getByRole('group', { name: 'Цветовая тема' }).getByRole('button', { name: 'Тёмная' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mission-view', 'simple');
  await expect(page.locator('html')).toHaveAttribute('data-mission-theme', 'dark');
  await expect(page.locator('main')).toHaveClass(/mission-app--simple/);
  await expect(page.locator('main')).toHaveClass(/mission-app--dark/);

  await page.getByRole('group', { name: 'Версия интерфейса' }).getByRole('button', { name: 'Подробная' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mission-view', 'detailed');
  await expect(page.locator('html')).toHaveAttribute('data-mission-theme', 'dark');
  await expect(page.getByText('ИИ центра управления')).toBeVisible();
  await expect(page.getByText('Лента событий')).toBeVisible();

  await page.getByRole('group', { name: 'Цветовая тема' }).getByRole('button', { name: 'Светлая' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mission-view', 'detailed');
  await expect(page.locator('html')).toHaveAttribute('data-mission-theme', 'light');
  await expect(page.locator('main')).toHaveClass(/mission-app--detailed/);
  await expect(page.locator('main')).toHaveClass(/mission-app--light/);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-mission-view', 'detailed');
  await expect(page.locator('html')).toHaveAttribute('data-mission-theme', 'light');
  await expect(page.getByRole('group', { name: 'Версия интерфейса' }).getByRole('button', { name: 'Подробная' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Цветовая тема' }).getByRole('button', { name: 'Светлая' })).toHaveAttribute('aria-pressed', 'true');
});
