import type { SqliteDatabase } from '@/infrastructure/db/client';
import { parseJson } from '@/lib/json';

export function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

export function intToBool(value: unknown): boolean {
  return value === 1 || value === true;
}

export function jsonColumn<T>(value: unknown, fallback: T): T {
  return typeof value === 'string' ? parseJson(value, fallback) : fallback;
}


export function requiredJsonColumn<T>(value: unknown, columnName: string): T {
  if (typeof value !== 'string') throw new Error(`Expected JSON text in ${columnName}`);
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${columnName}`, { cause: error });
  }
}

export function countTable(db: SqliteDatabase, table: string): number {
  if (!/^[a-z_]+$/.test(table)) throw new Error(`Unsafe table name: ${table}`);
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number };
  return Number(row.count);
}
