import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers/test-context';

const openDatabases: { close(): void }[] = [];
afterEach(() => { while (openDatabases.length) openDatabases.pop()?.close(); });

describe('demo bootstrap persistence', () => {
  it('persists the scenario, world, mission, fleet, orders, initial economy and snapshot', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const missionId = context.useCases.initialize.execute();
    const dashboard = context.useCases.dashboard.execute(missionId);
    const counts = context.metrics.counts();

    expect(dashboard.rovers).toHaveLength(3);
    expect(dashboard.orders).toHaveLength(6);
    expect(dashboard.orders.find((order) => order.code === 'HAB-021')?.impossibleReason).toMatch(/capacity/i);
    expect(dashboard.world.nodes.length).toBeGreaterThan(4);
    expect(counts.scenarios).toBe(1);
    expect(counts.missions).toBe(1);
    expect(counts.rovers).toBe(3);
    expect(counts.orders).toBe(6);
    expect(context.repositories.economy.listByMission(missionId)).toHaveLength(1);
    expect(context.repositories.snapshots.list(missionId).map((item) => item.reason)).toContain('mission_initialized');
  });
});
