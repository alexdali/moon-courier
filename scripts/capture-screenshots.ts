import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { screenshotsDir } from './lib/project-paths';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
mkdirSync(screenshotsDir, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  for (const [name, path] of [['mission-control', '/'], ['scenario-architect', '/scenario'], ['mission-debrief', '/analytics'], ['ops', '/ops']] as const) {
    await page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: resolve(screenshotsDir, `${name}.png`), fullPage: true });
    console.log(`Captured ${name}.png`);
  }
} finally {
  await browser.close();
}
