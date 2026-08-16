import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { screenshotsDir } from './lib/project-paths';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
mkdirSync(screenshotsDir, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.localStorage.removeItem('moon-courier-view-mode');
    window.localStorage.removeItem('moon-courier-theme');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: resolve(screenshotsDir, 'mission-control.png'), fullPage: true });
  console.log('Captured mission-control.png');
  await page.getByRole('group', { name: 'Цветовая тема' }).getByRole('button', { name: 'Тёмная' }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: resolve(screenshotsDir, 'mission-control-simple-dark.png'), fullPage: true });
  console.log('Captured mission-control-simple-dark.png');
  await page.getByRole('group', { name: 'Версия интерфейса' }).getByRole('button', { name: 'Подробная' }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: resolve(screenshotsDir, 'mission-control-detailed.png'), fullPage: true });
  console.log('Captured mission-control-detailed.png');
  await page.getByRole('group', { name: 'Цветовая тема' }).getByRole('button', { name: 'Светлая' }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: resolve(screenshotsDir, 'mission-control-detailed-light.png'), fullPage: true });
  console.log('Captured mission-control-detailed-light.png');
  for (const [name, path] of [['scenario-architect', '/scenario'], ['mission-debrief', '/analytics'], ['ops', '/ops']] as const) {
    await page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: resolve(screenshotsDir, `${name}.png`), fullPage: true });
    console.log(`Captured ${name}.png`);
  }
} finally {
  await browser.close();
}
