import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { getEnv } from '@/config/env';
import { hasFlag } from './lib/cli';

if (!hasFlag('--yes')) throw new Error('Refusing to reset without --yes');
const configured = getEnv().DATABASE_PATH;
if (configured === ':memory:') throw new Error('DATABASE_PATH=:memory: cannot be reset on disk');
const absolute = resolve(process.cwd(), configured);
for (const suffix of ['', '-wal', '-shm']) {
  const path = `${absolute}${suffix}`;
  if (existsSync(path)) rmSync(path, { force: true });
}
console.log(`Removed ${absolute} and SQLite sidecar files.`);
