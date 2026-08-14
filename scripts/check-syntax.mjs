import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src', 'scripts'];
const diagnostics = [];
let count = 0;
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.tsx?$/.test(entry.name)) {
      count += 1;
      const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, entry.name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      for (const item of source.parseDiagnostics) diagnostics.push({ path, item, source });
    }
  }
}
for (const root of roots) walk(root);
if (diagnostics.length) {
  for (const { path, item, source } of diagnostics) {
    const position = source.getLineAndCharacterOfPosition(item.start ?? 0);
    console.error(`${path}:${position.line + 1}:${position.character + 1} ${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`);
  }
  process.exit(1);
}
console.log(`Syntax validation passed for ${count} TypeScript/TSX files.`);
