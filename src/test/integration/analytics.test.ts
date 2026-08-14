import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers/test-context';

const openDatabases: { close(): void }[] = [];
afterEach(() => { while (openDatabases.length) openDatabases.pop()?.close(); });

describe('analytics read model', () => {
  it('derives KPIs, evidence and counterfactuals from persisted state', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const missionId = context.useCases.initialize.execute();
    const dashboard = context.useCases.dashboard.execute(missionId);
    const order = dashboard.orders.find((item) => item.code === 'BIO-014')!;
    const rover = dashboard.rovers.find((item) => item.code === 'SCOUT-2')!;
    context.useCases.launch.execute({ missionId, orderId: order.id, roverId: rover.id, idempotencyKey: 'analytics-delivery' });

    const analytics = context.useCases.analytics.execute(missionId, 12);
    expect(analytics.kpis.totalDeliveries).toBe(1);
    expect(analytics.evidence.deliveryCount).toBe(1);
    expect(analytics.evidence.eventCount).toBeGreaterThan(2);
    expect(analytics.evidence.simulationIterations).toBe(36);
    expect(analytics.comparison.map((item) => item.key)).toEqual(['baseline', 'extra-heavy-rover', 'faster-charging']);
    expect(analytics.roverUtilization).toHaveLength(3);
  });
});
