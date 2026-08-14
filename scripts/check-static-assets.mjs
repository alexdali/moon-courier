import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const mockupRoot = join(root, 'public', 'mockups');
const htmlFiles = [];
const jsFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (extname(entry.name).toLowerCase() === '.html') htmlFiles.push(path);
    else if (extname(entry.name).toLowerCase() === '.js') jsFiles.push(path);
  }
}

walk(mockupRoot);
const missing = [];
let references = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const target = match[1].trim();
    if (!target || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(target)) continue;
    references += 1;
    const pathOnly = decodeURIComponent(target.split('#')[0].split('?')[0]);
    if (!existsSync(resolve(dirname(file), pathOnly))) {
      missing.push(`${file.slice(root.length + 1)} -> ${target}`);
    }
  }
}

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

if (missing.length > 0) {
  console.error(`Static asset validation failed (${missing.length} missing):`);
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Static asset validation passed: ${htmlFiles.length} HTML files, ${references} local references, ${jsFiles.length} JavaScript files.`);
