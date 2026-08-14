import type { EventRepository } from '@/application/ports/event-repository';
import type { MissionId } from '@/domain/common/ids';
import type { MissionEvent } from '@/domain/entities/event';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { mapEvent } from '@/infrastructure/db/row-mappers';

export class SqliteEventRepository implements EventRepository {
  constructor(private readonly db: SqliteDatabase) {}
  listByMission(missionId: MissionId, limit = 200): readonly MissionEvent[] {
    const rows = this.db.prepare(`SELECT * FROM (
      SELECT * FROM events WHERE mission_id = ? ORDER BY sequence DESC LIMIT ?
    ) ORDER BY sequence`).all(missionId, limit) as Record<string, unknown>[];
    return rows.map(mapEvent);
  }
  insertMany(events: readonly MissionEvent[]): void {
    const statement = this.db.prepare(`INSERT INTO events
      (id, mission_id, delivery_id, sequence, type, severity, title, message, payload_json, occurred_at, simulation_offset_ms)
      VALUES (@id, @missionId, @deliveryId, @sequence, @type, @severity, @title, @message, @payloadJson, @occurredAt, @simulationOffsetMs)`);
    this.db.transaction(() => events.forEach((event) => statement.run({ ...event, payloadJson: JSON.stringify(event.payload) })))();
  }
  getNextSequence(missionId: MissionId): number {
    const row = this.db.prepare('SELECT COALESCE(MAX(sequence), 0) + 1 AS next FROM events WHERE mission_id = ?').get(missionId) as { next: number };
    return Number(row.next);
  }
  countByMission(missionId: MissionId): number {
    const row = this.db.prepare('SELECT COUNT(*) AS count FROM events WHERE mission_id = ?').get(missionId) as { count: number };
    return Number(row.count);
  }
  deleteByMission(missionId: MissionId): void { this.db.prepare('DELETE FROM events WHERE mission_id = ?').run(missionId); }
}
