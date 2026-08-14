import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set(['node_modules', '.next', '.git', 'coverage', 'playwright-report', 'test-results']);
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.yml', '.yaml', '.env', '.example', '.txt']);
const findings = [];
let scanned = 0;

function shouldScan(path) {
  const name = basename(path);
  return name === '.env.example' || textExtensions.has(extname(name).toLowerCase());
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
      continue;
    }
    if (!shouldScan(path)) continue;
    scanned += 1;
    const text = readFileSync(path, 'utf8');
    if (/\bsk-or-v1-[A-Za-z0-9_-]{20,}\b/.test(text)) findings.push(`${path}: OpenRouter key pattern`);
    if (/\b(?:OPENAI|DEEPSEEK|OPENROUTER)_API_KEY\s*=\s*["']?(?!$|\s|your_|ваш_|change-me|example)[A-Za-z0-9_-]{20,}/im.test(text)) {
      findings.push(`${path}: non-empty API key assignment`);
    }
  }
}

walk(root);
if (findings.length > 0) {
  console.error('Secret scan failed:');
  for (const item of findings) console.error(`- ${item}`);
  process.exit(1);
}
console.log(`Secret scan passed: ${scanned} text/config files, no credential patterns.`);
