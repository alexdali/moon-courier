import type { EconomyRepository } from '@/application/ports/economy-repository';
import type { MissionId } from '@/domain/common/ids';
import type { EconomyEntry } from '@/domain/entities/economy';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { mapEconomyEntry } from '@/infrastructure/db/row-mappers';

export class SqliteEconomyRepository implements EconomyRepository {
  constructor(private readonly db: SqliteDatabase) {}
  listByMission(missionId: MissionId): readonly EconomyEntry[] {
    // Multiple ledger entries can share a timestamp (fixed clocks in tests and
    // one atomic delivery resolution in production). rowid preserves their
    // insertion order, whereas sorting by the opaque text id does not.
    return (this.db.prepare('SELECT * FROM economy_entries WHERE mission_id = ? ORDER BY created_at, rowid').all(missionId) as Record<string, unknown>[]).map(mapEconomyEntry);
  }
  insertMany(entries: readonly EconomyEntry[]): void {
    const statement = this.db.prepare(`INSERT INTO economy_entries
      (id, mission_id, delivery_id, event_id, type, amount_credits, balance_after, description, created_at)
      VALUES (@id, @missionId, @deliveryId, @eventId, @type, @amountCredits, @balanceAfter, @description, @createdAt)`);
    this.db.transaction(() => entries.forEach((entry) => statement.run(entry)))();
  }
  deleteByMission(missionId: MissionId): void { this.db.prepare('DELETE FROM economy_entries WHERE mission_id = ?').run(missionId); }
}
