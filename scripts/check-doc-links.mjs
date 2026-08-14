import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';

const root = process.cwd();
const markdownFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'coverage', 'playwright-report', 'test-results'].includes(entry.name)) continue;
      walk(path);
    } else if (extname(entry.name).toLowerCase() === '.md') {
      markdownFiles.push(path);
    }
  }
}

walk(root);
const missing = [];
let checked = 0;

for (const file of markdownFiles) {
  const source = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  const links = [...source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim());
  for (const rawTarget of links) {
    const target = rawTarget.replace(/^<|>$/g, '').split(/\s+["']/)[0];
    if (!target || /^(?:https?:|mailto:|tel:|data:|#)/i.test(target)) continue;
    const withoutFragment = decodeURIComponent(target.split('#')[0].split('?')[0]);
    if (!withoutFragment) continue;
    checked += 1;
    const candidate = resolve(dirname(file), normalize(withoutFragment));
    if (!existsSync(candidate)) {
      missing.push(`${file.slice(root.length + 1)} -> ${target}`);
    }
  }
}

if (missing.length > 0) {
  console.error(`Documentation link validation failed (${missing.length} missing):`);
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Documentation link validation passed: ${markdownFiles.length} Markdown files, ${checked} local links.`);
