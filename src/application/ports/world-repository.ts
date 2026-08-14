import type { ScenarioId } from '@/domain/common/ids';
import type { WorldMap } from '@/domain/entities/world';

export interface WorldRepository {
  getByScenarioId(id: ScenarioId): WorldMap;
  replaceForScenario(id: ScenarioId, world: WorldMap): void;
}
