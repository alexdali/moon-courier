import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { planRoute } from '@/domain/routing/route-planner';

describe('route planner', () => {
  it('plans a connected route and accounts for rover approach to the order origin', () => {
    const state = createFixtureState();
    const order = state.orders.find((item) => item.code === 'COM-008')!;
    const rover = { ...state.rovers[0]!, nodeId: order.destinationNodeId };
    const route = planRoute({ world: state.scenario.world, rover, order, objective: 'balanced' });
    expect(route).not.toBeNull();
    expect(route!.nodeIds[0]).toBe(rover.nodeId);
    expect(route!.nodeIds).toContain(order.originNodeId);
    expect(route!.nodeIds.at(-1)).toBe(order.destinationNodeId);
    expect(route!.energyKwh).toBeGreaterThan(0);
  });
});
