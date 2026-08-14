import { describe, expect, it } from 'vitest';
import { calculateCapacityDeficitKg, calculateCapacityUtilizationPercent, calculateLoadRatio } from '@/domain/rules/load';

describe('load rules', () => {
  it('calculates ratio, utilization and deficit', () => {
    expect(calculateLoadRatio(72, 120)).toBeCloseTo(0.6);
    expect(calculateCapacityUtilizationPercent(72, 120)).toBe(60);
    expect(calculateCapacityDeficitKg(148, 120)).toBe(28);
  });
});
