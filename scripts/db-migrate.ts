import { createDatabase } from '@/infrastructure/db/client';
import { applyMigrations } from '@/infrastructure/db/migrate';

const db = createDatabase();
try {
  const applied = applyMigrations(db);
  console.log(applied.length > 0 ? `Applied ${applied.length} migration(s): ${applied.map((item) => item.name).join(', ')}` : 'Database is already up to date.');
} finally {
  db.close();
}
