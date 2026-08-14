import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers/test-context';

const openDatabases: { close(): void }[] = [];
afterEach(() => { while (openDatabases.length) openDatabases.pop()?.close(); });

describe('dispatch lifecycle', () => {
  it('rejects the mandatory impossible assignment before state mutation', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const missionId = context.useCases.initialize.execute();
    const dashboard = context.useCases.dashboard.execute(missionId);
    const order = dashboard.orders.find((item) => item.code === 'HAB-021')!;
    const rover = dashboard.rovers.find((item) => item.code === 'ATLAS-1')!;
    const preview = context.useCases.preview.execute({ missionId, orderId: order.id, roverId: rover.id });

    expect(preview.feasibility.status).toBe('impossible');
    expect(() => context.useCases.launch.execute({
      missionId,
      orderId: order.id,
      roverId: rover.id,
      idempotencyKey: 'impossible-attempt',
    })).toThrow(/impossible/i);
    expect(context.repositories.deliveries.listByMission(missionId)).toHaveLength(0);
  });

  it('atomically resolves a feasible delivery and replays duplicate idempotency keys', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const missionId = context.useCases.initialize.execute();
    const before = context.useCases.dashboard.execute(missionId);
    const order = before.orders.find((item) => item.code === 'MED-017')!;
    const rover = before.rovers.find((item) => item.code === 'ATLAS-1')!;
    const preview = context.useCases.preview.execute({ missionId, orderId: order.id, roverId: rover.id });
    expect(preview.feasibility.status).not.toBe('impossible');

    const first = context.useCases.launch.execute({
      missionId,
      orderId: order.id,
      roverId: rover.id,
      objective: 'balanced',
      idempotencyKey: 'dispatch-med-017',
    });
    const deliveryCount = context.repositories.deliveries.listByMission(missionId).length;
    const eventCount = context.repositories.events.countByMission(missionId);
    const economyCount = context.repositories.economy.listByMission(missionId).length;
    const second = context.useCases.launch.execute({
      missionId,
      orderId: order.id,
      roverId: rover.id,
      objective: 'balanced',
      idempotencyKey: 'dispatch-med-017',
    });

    expect(second.delivery.id).toBe(first.delivery.id);
    expect(context.repositories.deliveries.listByMission(missionId)).toHaveLength(deliveryCount);
    expect(context.repositories.events.countByMission(missionId)).toBe(eventCount);
    expect(context.repositories.economy.listByMission(missionId)).toHaveLength(economyCount);
    expect(first.rover.batteryPercent).toBeLessThan(rover.batteryPercent);
    expect(['delivered', 'failed']).toContain(first.order.status);
    expect(first.mission.credits).not.toBe(before.mission.credits);
    expect(context.repositories.snapshots.list(missionId).at(-1)?.reason).toMatch(/^delivery_/);
  });
});
