import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { planRoute } from '@/domain/routing/route-planner';
import { estimateDeliveryEconomy } from '@/domain/rules/economy';
import { resolveDelivery } from '@/domain/simulation/delivery-resolver';

describe('delivery resolver', () => {
  it('is deterministic for the same seed and updates all state dimensions', () => {
    const state = createFixtureState();
    const order = state.orders.find((item) => item.code === 'COM-008')!;
    const rover = state.rovers.find((item) => item.code === 'SCOUT-2')!;
    const route = planRoute({ world: state.scenario.world, rover, order, objective: 'balanced' })!;
    const economy = estimateDeliveryEconomy({ order, route, rules: state.scenario.rules, currentMinute: 0 });
    const input = { mission: state.mission, scenario: state.scenario, rover, order, route, deliveryId: 'delivery_test', idempotencyKey: 'test', startedAt: '2026-08-15T00:00:00.000Z', eventSequenceStart: 0, expectedNetCredits: economy.expectedNetCredits, seed: 123 } as const;
    const first = resolveDelivery(input);
    const second = resolveDelivery(input);
    expect(first).toEqual(second);
    expect(first.roverAfter.batteryPercent).toBeLessThan(rover.batteryPercent);
    expect(['delivered', 'failed']).toContain(first.orderAfter.status);
    expect(first.events.length).toBeGreaterThan(2);
    expect(first.economyEntries.length).toBeGreaterThan(1);
  });
});
