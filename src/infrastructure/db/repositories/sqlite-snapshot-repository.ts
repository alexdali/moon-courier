import type { SnapshotRepository } from '@/application/ports/snapshot-repository';
import type { MissionId } from '@/domain/common/ids';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { jsonColumn } from '@/infrastructure/db/sqlite-helpers';

export class SqliteSnapshotRepository implements SnapshotRepository {
  constructor(private readonly db: SqliteDatabase) {}
  save(missionId: MissionId, reason: string, state: unknown, createdAt: string): void {
    const row = this.db.prepare('SELECT COALESCE(MAX(sequence), 0) + 1 AS next FROM mission_snapshots WHERE mission_id = ?').get(missionId) as { next: number };
    const sequence = Number(row.next);
    this.db.prepare(`INSERT INTO mission_snapshots (id, mission_id, sequence, reason, state_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`).run(`${missionId}_snapshot_${sequence}`, missionId, sequence, reason, JSON.stringify(state), createdAt);
  }
  list(missionId: MissionId): readonly { sequence: number; reason: string; state: unknown; createdAt: string }[] {
    return (this.db.prepare('SELECT sequence, reason, state_json, created_at FROM mission_snapshots WHERE mission_id = ? ORDER BY sequence').all(missionId) as Record<string, unknown>[]).map((row) => ({
      sequence: Number(row.sequence), reason: String(row.reason), state: jsonColumn(row.state_json, {}), createdAt: String(row.created_at),
    }));
  }
}
