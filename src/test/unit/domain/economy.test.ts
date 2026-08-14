import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { planRoute } from '@/domain/routing/route-planner';
import { estimateDeliveryEconomy } from '@/domain/rules/economy';

describe('economy estimate', () => {
  it('subtracts energy, risk and lateness from gross reward', () => {
    const state = createFixtureState();
    const order = state.orders.find((item) => item.code === 'MED-017')!;
    const rover = state.rovers[0]!;
    const route = planRoute({ world: state.scenario.world, rover, order, objective: 'balanced' })!;
    const estimate = estimateDeliveryEconomy({ order, route, rules: state.scenario.rules, currentMinute: 500 });
    expect(estimate.expectedNetCredits).toBeLessThan(order.rewardCredits);
    expect(estimate.energyCostCredits).toBeGreaterThan(0);
    expect(estimate.expectedLatePenaltyCredits).toBeGreaterThan(0);
  });
});
