import type { SqliteDatabase } from '@/infrastructure/db/client';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface AppliedMigration {
  name: string;
  appliedAt: string;
}

export function applyMigrations(db: SqliteDatabase, directory = resolve(process.cwd(), 'migrations')): AppliedMigration[] {
  if (!existsSync(directory)) throw new Error(`Migration directory does not exist: ${directory}`);
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);
  const applied = new Set(
    (db.prepare('SELECT name FROM schema_migrations ORDER BY name').all() as { name: string }[]).map((row) => row.name),
  );
  const files = readdirSync(directory).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
  const results: AppliedMigration[] = [];
  const applyOne = db.transaction((file: string) => {
    const sql = readFileSync(join(directory, file), 'utf8');
    db.exec(sql);
    const appliedAt = new Date().toISOString();
    db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(file, appliedAt);
    results.push({ name: file, appliedAt });
  });
  for (const file of files) if (!applied.has(file)) applyOne(file);
  return results;
}
