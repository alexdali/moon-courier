import type { ScenarioDefinition } from '@/domain/entities/scenario';
import { compileScenarioBlueprint } from '@/domain/scenarios/scenario-compiler';
import { createDeterministicScenarioBlueprint } from '@/domain/scenarios/deterministic-generator';

export const DEMO_SCENARIO_SEED = 384719;
export const DEMO_MISSION_ID = 'mission_shackleton_demo';

export function createDemoScenario(seed = DEMO_SCENARIO_SEED): ScenarioDefinition {
  return {
    ...compileScenarioBlueprint(createDeterministicScenarioBlueprint(seed)),
    source: 'fixture',
  };
}
