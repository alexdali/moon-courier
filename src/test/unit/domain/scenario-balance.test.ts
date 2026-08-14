import { describe, expect, it } from 'vitest';
import { createDemoScenario } from '@/fixtures/demo-scenario';
import { analyzeScenarioBalance } from '@/domain/scenarios/balance-analyzer';

describe('scenario balance', () => {
  it('is survivable but not trivially guaranteed', () => {
    const result = analyzeScenarioBalance(createDemoScenario(), 200);
    expect(result.survivable).toBe(true);
    expect(result.successRate).toBeGreaterThan(0.2);
    expect(result.successRate).toBeLessThan(0.9);
  });
});
