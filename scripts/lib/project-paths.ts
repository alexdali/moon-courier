import { resolve } from 'node:path';

export const projectRoot = resolve(import.meta.dirname, '../..');
export const reportsDir = resolve(projectRoot, 'reports');
export const screenshotsDir = resolve(projectRoot, 'screenshots');
export const migrationsDir = resolve(projectRoot, 'migrations');
