import type { MissionId } from '@/domain/common/ids';
import type { MissionEvent } from '@/domain/entities/event';

export interface EventRepository {
  listByMission(missionId: MissionId, limit?: number): readonly MissionEvent[];
  insertMany(events: readonly MissionEvent[]): void;
  getNextSequence(missionId: MissionId): number;
  countByMission(missionId: MissionId): number;
  deleteByMission(missionId: MissionId): void;
}
