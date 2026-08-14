import { clamp, roundTo } from '@/domain/common/math';

export function calculateLoadRatio(weightKg: number, capacityKg: number): number {
  if (capacityKg <= 0) return Number.POSITIVE_INFINITY;
  return weightKg / capacityKg;
}

export function calculateCapacityUtilizationPercent(weightKg: number, capacityKg: number): number {
  return roundTo(clamp(calculateLoadRatio(weightKg, capacityKg) * 100, 0, 999), 1);
}

export function calculateCapacityDeficitKg(weightKg: number, capacityKg: number): number {
  return roundTo(Math.max(0, weightKg - capacityKg), 1);
}
