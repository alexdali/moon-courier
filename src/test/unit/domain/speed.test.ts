import { describe, expect, it } from 'vitest';
import { calculateEffectiveSpeedKph, calculateTravelMinutes } from '@/domain/rules/speed';

describe('speed rules', () => {
  it('reduces speed with load and slow terrain', () => {
    const fast = calculateEffectiveSpeedKph({ baseSpeedKph: 40, edgeSpeedFactor: 1, zoneSpeedMultiplier: 1, loadRatio: 0 });
    const slow = calculateEffectiveSpeedKph({ baseSpeedKph: 40, edgeSpeedFactor: .7, zoneSpeedMultiplier: .8, loadRatio: 1 });
    expect(slow).toBeLessThan(fast);
    expect(calculateTravelMinutes(20, 40)).toBe(30);
  });
});
