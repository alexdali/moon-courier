import type { ScenarioId } from '@/domain/common/ids';
import type { ScenarioDefinition } from '@/domain/entities/scenario';
import type { ScenarioValidationReport } from '@/domain/scenarios/scenario-validator';

export interface ScenarioRepository {
  getById(id: ScenarioId): ScenarioDefinition | null;
  list(): readonly ScenarioDefinition[];
  save(definition: ScenarioDefinition, options: { validation: ScenarioValidationReport; prompt?: string; model?: string }): void;
  deleteAll(): void;
}
