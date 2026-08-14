import type { TransactionRunner } from '@/application/ports/transaction-runner';
import type { SqliteDatabase } from '@/infrastructure/db/client';

export class SqliteTransactionRunner implements TransactionRunner {
  constructor(private readonly db: SqliteDatabase) {}
  run<T>(operation: () => T): T { return this.db.transaction(operation)(); }
}
