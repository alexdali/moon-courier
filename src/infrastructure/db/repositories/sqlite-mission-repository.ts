import type { MissionRepository } from '@/application/ports/mission-repository';
import type { MissionId } from '@/domain/common/ids';
import type { Mission } from '@/domain/entities/mission';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { mapMission } from '@/infrastructure/db/row-mappers';

export class SqliteMissionRepository implements MissionRepository {
  constructor(private readonly db: SqliteDatabase) {}
  getById(id: MissionId): Mission | null {
    const row = this.db.prepare('SELECT * FROM missions WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? mapMission(row) : null;
  }
  getCurrent(): Mission | null {
    const row = this.db.prepare("SELECT * FROM missions ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'ready' THEN 1 ELSE 2 END, updated_at DESC LIMIT 1").get() as Record<string, unknown> | undefined;
    return row ? mapMission(row) : null;
  }
  create(mission: Mission): void {
    this.db.prepare(`INSERT INTO missions
      (id, scenario_id, name, status, current_minute, current_day, credits, score, rating, target_credits, seed, started_at, ended_at, created_at, updated_at)
      VALUES (@id, @scenarioId, @name, @status, @currentMinute, @currentDay, @credits, @score, @rating, @targetCredits, @seed, @startedAt, @endedAt, @createdAt, @updatedAt)`).run(mission);
  }
  update(mission: Mission): void {
    this.db.prepare(`UPDATE missions SET status=@status, current_minute=@currentMinute, current_day=@currentDay,
      credits=@credits, score=@score, rating=@rating, target_credits=@targetCredits, started_at=@startedAt,
      ended_at=@endedAt, updated_at=@updatedAt WHERE id=@id`).run(mission);
  }
  deleteAll(): void { this.db.prepare('DELETE FROM missions').run(); }
}
