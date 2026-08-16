import { expect, test } from '@playwright/test';

const routes = ['/', '/scenario', '/analytics', '/ops', '/about'] as const;

const forbiddenEnglishUi = [
  'MOON COURIER',
  'Shackleton Medical Surge',
  'Medical oxygen',
  'Communication module',
  'Biological samples',
  'Water recycling filters',
  'Solar inverter',
  'Habitat pressure frame',
  'Scenario Architect',
  'Mission Debrief',
  'Mission Control AI',
  'Dispatch preview',
  'Event stream',
  'Operational analytics',
  'Evidence before explanation',
  'Operations & Evidence',
  'Recent AI runs',
  'AI routing',
  'JSON Schema',
  'Generate worlds',
  'Saved scenarios',
  'No generated world yet',
] as const;

test('Russian UI contains no known English interface copy', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page).toHaveTitle('Лунный курьер: кризис');
    const text = await page.locator('body').innerText();
    for (const phrase of forbiddenEnglishUi) expect(text, `${route} contains "${phrase}"`).not.toContain(phrase);
  }
});

test('Russian mission surface localizes dynamic domain content and units', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ЛУННЫЙ КУРЬЕР')).toBeVisible();
  await expect(page.getByText('Медицинский кризис у Шеклтона')).toBeVisible();
  await expect(page.getByText('Медицинский кислород')).toBeVisible();
  await expect(page.getByText('Силовой каркас жилого модуля')).toBeVisible();
  const text = await page.locator('body').innerText();
  expect(text).toContain('кг');
  expect(text).toContain('кр.');
  expect(text).not.toMatch(/\b(?:kg|km\/h|CR)\b/);
  const atlas = page.locator('.rover-card').filter({ hasText: 'ATLAS-1' });
  await atlas.getByText('Подробнее').click();
  await expect(atlas).toContainText('км/ч');
});

test('Russian scenario surface localizes presets and validation terminology', async ({ page }) => {
  await page.goto('/scenario');
  await expect(page.getByText('Генерация мира с помощью ИИ')).toBeVisible();
  await expect(page.locator('textarea')).toHaveValue(/Создай семидневную миссию/);
  await page.getByRole('button', { name: 'Шаблон 2' }).click();
  await expect(page.locator('textarea')).toHaveValue(/Создай безопасный учебный сценарий/);
});
