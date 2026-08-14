import { rmSync } from 'node:fs';

for (const path of ['.next', 'coverage', 'playwright-report', 'test-results', 'screenshots/generated']) {
  rmSync(path, { recursive: true, force: true });
}
console.log('Generated build/test artifacts removed.');
