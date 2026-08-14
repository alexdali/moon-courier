import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { planRoute } from '@/domain/routing/route-planner';
import { evaluateDispatchFeasibility } from '@/domain/rules/feasibility';

describe('dispatch feasibility', () => {
  it('blocks the intentionally oversized order for every rover', () => {
    const state = createFixtureState();
    const order = state.orders.find((item) => item.code === 'HAB-021')!;
    for (const rover of state.rovers) {
      const route = planRoute({ world: state.scenario.world, rover, order, objective: 'balanced' });
      const result = evaluateDispatchFeasibility({ order, rover, route, rules: state.scenario.rules, currentMinute: 0 });
      expect(result.status).toBe('impossible');
      expect(result.blockingReasons.some((item) => item.code === 'CAPACITY_EXCEEDED')).toBe(true);
    }
  });

  it('blocks a route that violates the battery reserve', () => {
    const state = createFixtureState();
    const order = state.orders.find((item) => item.code === 'MED-017')!;
    const rover = { ...state.rovers[0]!, batteryPercent: 1 };
    const route = planRoute({ world: state.scenario.world, rover, order, objective: 'balanced' });
    const result = evaluateDispatchFeasibility({ order, rover, route, rules: state.scenario.rules, currentMinute: 0 });
    expect(result.blockingReasons.some((item) => item.code === 'BATTERY_INSUFFICIENT')).toBe(true);
  });
});
