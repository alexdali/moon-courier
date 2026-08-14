import type { MissionId } from '@/domain/common/ids';
import type { EconomyEntry } from '@/domain/entities/economy';

export interface EconomyRepository {
  listByMission(missionId: MissionId): readonly EconomyEntry[];
  insertMany(entries: readonly EconomyEntry[]): void;
  deleteByMission(missionId: MissionId): void;
}
