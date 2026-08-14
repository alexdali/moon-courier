import { createDemoScenario } from '@/fixtures/demo-scenario';
import { createInMemoryMission } from '@/domain/simulation/mission-factory';

export function createFixtureState(seed = 384719) {
  const scenario = createDemoScenario(seed);
  return { scenario, ...createInMemoryMission(scenario, String(seed)) };
}
