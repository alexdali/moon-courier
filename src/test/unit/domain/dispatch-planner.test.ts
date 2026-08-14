import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { recommendDispatch } from '@/domain/planning/dispatch-planner';

describe('dispatch planner', () => {
  it('returns a feasible candidate and respects excluded rovers', () => {
    const state = createFixtureState();
    const candidate = recommendDispatch({
      mission: state.mission,
      scenario: state.scenario,
      orders: state.orders,
      rovers: state.rovers,
      constraints: {
        prioritizeUrgencies: ['critical', 'high', 'normal', 'low'],
        minimumBatteryReservePercent: 15,
        maximumIncidentRisk: null,
        excludedRoverCodes: ['ATLAS-1'],
        preferredObjective: 'balanced',
        prioritizeProfit: false,
      },
    });
    expect(candidate).not.toBeNull();
    expect(candidate!.rover.code).not.toBe('ATLAS-1');
    expect(candidate!.feasibility.status).not.toBe('impossible');
  });
});
