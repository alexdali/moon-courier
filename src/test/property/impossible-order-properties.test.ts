import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { planRoute } from '@/domain/routing/route-planner';
import { evaluateDispatchFeasibility } from '@/domain/rules/feasibility';

describe('impossible order invariant', () => {
  it('remains blocked for any battery level because capacity is insufficient', () => {
    const state = createFixtureState();
    const order = state.orders.find((item) => item.code === 'HAB-021')!;
    fc.assert(
      fc.property(fc.double({ min: 0, max: 100, noNaN: true }), (batteryPercent) => {
        for (const baseRover of state.rovers) {
          const rover = { ...baseRover, batteryPercent };
          const route = planRoute({ world: state.scenario.world, rover, order, objective: 'balanced' });
          const feasibility = evaluateDispatchFeasibility({
            order,
            rover,
            route,
            rules: state.scenario.rules,
            currentMinute: state.mission.currentMinute,
          });
          expect(feasibility.status).toBe('impossible');
          expect(feasibility.blockingReasons.some((reason) => reason.code === 'CAPACITY_EXCEEDED')).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
