import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers/test-context';

const openDatabases: { close(): void }[] = [];
afterEach(() => { while (openDatabases.length) openDatabases.pop()?.close(); });

describe('rover service operations', () => {
  it('charges a rover with persisted time, cost and event', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const missionId = context.useCases.initialize.execute();
    const before = context.useCases.dashboard.execute(missionId);
    const rover = before.rovers.find((item) => item.code === 'ATLAS-1')!;
    const result = context.useCases.charge.execute({ missionId, roverId: rover.id, targetBatteryPercent: 100 });

    expect(result.rover.batteryPercent).toBe(100);
    expect(result.mission.currentMinute).toBeGreaterThan(before.mission.currentMinute);
    expect(result.mission.credits).toBeLessThan(before.mission.credits);
    expect(context.repositories.events.listByMission(missionId).at(-1)?.type).toBe('ROVER_CHARGED');
    expect(context.repositories.economy.listByMission(missionId).at(-1)?.type).toBe('charging');
  });

  it('repairs a damaged rover exactly once through the repair operation', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const missionId = context.useCases.initialize.execute();
    const before = context.useCases.dashboard.execute(missionId);
    const rover = before.rovers.find((item) => item.code === 'ATLAS-1')!;
    context.repositories.rovers.update({ ...rover, status: 'damaged' });
    const result = context.useCases.repair.execute({ missionId, roverId: rover.id });

    expect(result.rover.status).toBe('available');
    expect(result.economyEntry.type).toBe('repair');
    expect(result.economyEntry.amountCredits).toBe(-rover.repairCostCredits);
    expect(() => context.useCases.repair.execute({ missionId, roverId: rover.id })).toThrow(/not damaged/i);
  });
});
