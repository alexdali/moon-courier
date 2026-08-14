import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const required = [
  'README.md', 'package.json', '.env.example', 'migrations/0001_initial.sql',
  'src/app/page.tsx', 'src/domain/rules/feasibility.ts', 'src/domain/simulation/delivery-resolver.ts',
  'src/modules/ai/routing/model-router.ts', 'src/modules/ai/agents/mission-control-agent.ts',
  'docs/FINAL_IMPLEMENTATION_PLAN.md', 'docs/FILE_MAP.md', 'docs/AI_PIPELINE.md',
];
const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error(`Missing required files:\n${missing.join('\n')}`);
  process.exit(1);
}
const sourceFiles = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(path);
  }
}
walk('src');
const unresolved = [];
for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  const matches = [...text.matchAll(/from\s+['"](@\/[^'"]+|\.\.?\/[^'"]+)['"]/g)];
  for (const match of matches) {
    const specifier = match[1];
    const base = specifier.startsWith('@/') ? resolve('src', specifier.slice(2)) : resolve(dirname(file), specifier);
    const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')];
    if (!candidates.some(existsSync)) unresolved.push(`${file}: ${specifier}`);
  }
}
if (unresolved.length) {
  console.error(`Unresolved local imports:\n${unresolved.join('\n')}`);
  process.exit(1);
}
console.log(`Structure validation passed: ${sourceFiles.length} source files, no unresolved local imports.`);
