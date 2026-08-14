import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers/test-context';

const openDatabases: { close(): void }[] = [];
afterEach(() => { while (openDatabases.length) openDatabases.pop()?.close(); });

describe('transaction boundary', () => {
  it('rolls back partial mission updates on failure', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const missionId = context.useCases.initialize.execute();
    const before = context.repositories.missions.getById(missionId)!;

    expect(() => context.transactions.run(() => {
      context.repositories.missions.update({ ...before, credits: before.credits + 999 });
      throw new Error('force rollback');
    })).toThrow('force rollback');

    expect(context.repositories.missions.getById(missionId)?.credits).toBe(before.credits);
  });
});
