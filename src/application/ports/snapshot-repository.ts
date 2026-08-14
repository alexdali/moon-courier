import type { MissionId } from '@/domain/common/ids';

export interface SnapshotRepository {
  save(missionId: MissionId, reason: string, state: unknown, createdAt: string): void;
  list(missionId: MissionId): readonly { sequence: number; reason: string; state: unknown; createdAt: string }[];
}
