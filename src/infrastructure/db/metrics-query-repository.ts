import type { SqliteDatabase } from '@/infrastructure/db/client';
import { countTable } from '@/infrastructure/db/sqlite-helpers';

export class MetricsQueryRepository {
  constructor(private readonly db: SqliteDatabase) {}
  counts(): Record<'scenarios' | 'missions' | 'rovers' | 'orders' | 'deliveries' | 'events' | 'aiRuns', number> {
    return {
      scenarios: countTable(this.db, 'scenarios'), missions: countTable(this.db, 'missions'),
      rovers: countTable(this.db, 'rovers'), orders: countTable(this.db, 'orders'),
      deliveries: countTable(this.db, 'deliveries'), events: countTable(this.db, 'events'),
      aiRuns: countTable(this.db, 'ai_runs'),
    };
  }
}
