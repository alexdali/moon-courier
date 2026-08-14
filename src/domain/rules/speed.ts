import { clamp, roundTo } from '@/domain/common/math';

export function calculateEffectiveSpeedKph(input: {
  baseSpeedKph: number;
  edgeSpeedFactor: number;
  zoneSpeedMultiplier: number;
  loadRatio: number;
}): number {
  const loadPenalty = 1 - 0.18 * clamp(input.loadRatio, 0, 1.5);
  return roundTo(
    Math.max(1, input.baseSpeedKph * input.edgeSpeedFactor * input.zoneSpeedMultiplier * loadPenalty),
    3,
  );
}

export function calculateTravelMinutes(distanceKm: number, speedKph: number): number {
  return roundTo((distanceKm / Math.max(1, speedKph)) * 60, 2);
}
