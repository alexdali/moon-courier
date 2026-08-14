import Database from 'better-sqlite3';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { getEnv } from '@/config/env';
import { applyMigrations } from '@/infrastructure/db/migrate';

export type SqliteDatabase = Database.Database;

declare global {
  var __moonCourierDb: SqliteDatabase | undefined;
}

export function createDatabase(path = getEnv().DATABASE_PATH): SqliteDatabase {
  const absolutePath = path === ':memory:' ? path : resolve(/* turbopackIgnore: true */ process.cwd(), path);
  if (absolutePath !== ':memory:') mkdirSync(dirname(absolutePath), { recursive: true });
  const db = new Database(absolutePath);
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  if (absolutePath !== ':memory:') db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  if (getEnv().DB_AUTO_MIGRATE) applyMigrations(db);
  return db;
}

export function getDatabase(): SqliteDatabase {
  if (!globalThis.__moonCourierDb) globalThis.__moonCourierDb = createDatabase();
  return globalThis.__moonCourierDb;
}

export function closeDatabaseForTests(): void {
  globalThis.__moonCourierDb?.close();
  globalThis.__moonCourierDb = undefined;
}
