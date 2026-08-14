import type { ScenarioDefinition } from '@/domain/entities/scenario';
import type { ScenarioBlueprint } from '@/domain/scenarios/blueprint';
import type { ScenarioBalanceReport } from '@/domain/scenarios/balance-analyzer';
import type { ScenarioValidationReport } from '@/domain/scenarios/scenario-validator';

export interface ScenarioGenerationDto {
  source: 'deepseek' | 'luna' | 'deterministic';
  model: string | null;
  blueprint: ScenarioBlueprint;
  scenario: ScenarioDefinition;
  validation: ScenarioValidationReport;
  balance: ScenarioBalanceReport;
  fallbackUsed: boolean;
}
