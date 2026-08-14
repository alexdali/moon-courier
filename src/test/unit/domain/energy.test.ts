import { describe, expect, it } from 'vitest';
import { calculateSegmentEnergyKwh, energyKwhToBatteryPercent } from '@/domain/rules/energy';

describe('energy rules', () => {
  it('makes heavier cargo consume more energy', () => {
    const empty = calculateSegmentEnergyKwh({ distanceKm: 10, baseEnergyKwhPerKm: .4, edgeEnergyFactor: 1, zoneEnergyMultiplier: 1, loadRatio: 0 });
    const loaded = calculateSegmentEnergyKwh({ distanceKm: 10, baseEnergyKwhPerKm: .4, edgeEnergyFactor: 1, zoneEnergyMultiplier: 1, loadRatio: 1 });
    expect(loaded).toBeGreaterThan(empty);
    expect(energyKwhToBatteryPercent(30, 60)).toBe(50);
  });
});
