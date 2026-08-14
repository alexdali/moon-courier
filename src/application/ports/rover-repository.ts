import type { MissionId, RoverId } from '@/domain/common/ids';
import type { Rover } from '@/domain/entities/rover';

export interface RoverRepository {
  listByMission(missionId: MissionId): readonly Rover[];
  getById(id: RoverId): Rover | null;
  insertMany(rovers: readonly Rover[]): void;
  update(rover: Rover): void;
  deleteByMission(missionId: MissionId): void;
}
