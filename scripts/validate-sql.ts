import { createDatabase } from '@/infrastructure/db/client';
import { applyMigrations } from '@/infrastructure/db/migrate';

process.env.DB_AUTO_MIGRATE = 'false';
const db = createDatabase(':memory:');
try {
  const applied = applyMigrations(db);
  const violations = db.pragma('foreign_key_check') as unknown[];
  const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[]).map((item) => item.name);
  if (violations.length > 0) throw new Error(`Foreign-key violations: ${JSON.stringify(violations)}`);
  console.log(`SQL validation passed: ${applied.length} migrations, ${tables.length} tables.`);
} finally {
  db.close();
}
