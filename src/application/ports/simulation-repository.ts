import type { SimulationRun } from '@/domain/entities/simulation';
import type { SimulationSample } from '@/domain/entities/simulation';

export interface SimulationRepository {
  save(run: SimulationRun, samples?: readonly SimulationSample[]): void;
  listRecent(limit: number): readonly SimulationRun[];
}
