import { describe, expect, it } from 'vitest';
import { createDemoScenario } from '@/fixtures/demo-scenario';
import { validateScenario } from '@/domain/scenarios/scenario-validator';

describe('scenario validator', () => {
  it('accepts the built-in scenario and identifies the impossible order', () => {
    const result = validateScenario(createDemoScenario());
    expect(result.valid).toBe(true);
    expect(result.impossibleOrderCodes).toContain('HAB-021');
    expect(result.feasiblePairCount).toBeGreaterThan(0);
  });

  it('rejects an unreachable economic target', () => {
    const scenario = createDemoScenario();
    const result = validateScenario({ ...scenario, rules: { ...scenario.rules, targetCredits: 999_999 } });
    expect(result.valid).toBe(false);
    expect(result.checks.find((item) => item.code === 'TARGET_GROSS_UPPER_BOUND')?.status).toBe('fail');
  });
});
