import { clamp, roundTo } from '@/domain/common/math';

export function calculateSegmentEnergyKwh(input: {
  distanceKm: number;
  baseEnergyKwhPerKm: number;
  edgeEnergyFactor: number;
  zoneEnergyMultiplier: number;
  loadRatio: number;
}): number {
  const loadMultiplier = 1 + 0.65 * clamp(input.loadRatio, 0, 2);
  return roundTo(
    input.distanceKm *
      input.baseEnergyKwhPerKm *
      input.edgeEnergyFactor *
      input.zoneEnergyMultiplier *
      loadMultiplier,
    4,
  );
}

export function energyKwhToBatteryPercent(energyKwh: number, batteryCapacityKwh: number): number {
  if (batteryCapacityKwh <= 0) return Number.POSITIVE_INFINITY;
  return roundTo((energyKwh / batteryCapacityKwh) * 100, 2);
}
