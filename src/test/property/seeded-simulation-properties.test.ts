import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { createDemoScenario } from '@/fixtures/demo-scenario';
import { safeBalancedPolicy } from '@/domain/planning/policies';
import { simulateScenarioOnce } from '@/domain/simulation/mission-simulator';

describe('seeded simulation properties', () => {
  it('replays exactly for the same seed', () => {
    const scenario = createDemoScenario();
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 2_000_000_000 }), (seed) => {
        const first = simulateScenarioOnce({ scenario, policy: safeBalancedPolicy, seed });
        const second = simulateScenarioOnce({ scenario, policy: safeBalancedPolicy, seed });
        expect(second).toEqual(first);
      }),
      { numRuns: 80 },
    );
  });

  it('never reports more completed outcomes than orders', () => {
    const scenario = createDemoScenario();
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 2_000_000_000 }), (seed) => {
        const sample = simulateScenarioOnce({ scenario, policy: safeBalancedPolicy, seed });
        expect(sample.deliveredOrders + sample.failedDeliveries + sample.expiredOrders)
          .toBeLessThanOrEqual(scenario.orderTemplates.length);
        expect(Number.isFinite(sample.finalCredits)).toBe(true);
      }),
      { numRuns: 80 },
    );
  });
});
