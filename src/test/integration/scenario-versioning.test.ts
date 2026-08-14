import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers/test-context';
import { createDemoScenario } from '@/fixtures/demo-scenario';
import { validateScenario } from '@/domain/scenarios/scenario-validator';

const openDatabases: { close(): void }[] = [];
afterEach(() => { while (openDatabases.length) openDatabases.pop()?.close(); });

describe('scenario persistence', () => {
  it('keeps immutable versions while updating the current projection', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    const first = createDemoScenario();
    const second = { ...first, name: `${first.name} Revised` };
    context.repositories.scenarios.save(first, { validation: validateScenario(first), prompt: 'first' });
    context.repositories.scenarios.save(second, { validation: validateScenario(second), prompt: 'second' });

    const count = context.db.prepare('SELECT COUNT(*) AS count FROM scenario_versions WHERE scenario_id = ?').get(first.id) as { count: number };
    expect(Number(count.count)).toBe(2);
    expect(context.repositories.scenarios.getById(first.id)?.name).toBe(second.name);
  });
});
