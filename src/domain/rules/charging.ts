import { clamp, roundTo } from '@/domain/common/math';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioRules } from '@/domain/entities/scenario';

export interface RoverChargePlan {
  currentBatteryPercent: number;
  targetBatteryPercent: number;
  addedBatteryPercent: number;
  energyAddedKwh: number;
  durationMinutes: number;
  costCredits: number;
  chargerAvailable: boolean;
}

export function calculateRoverChargePlan(input: {
  rover: Rover;
  rules: ScenarioRules;
  chargerAvailable: boolean;
  targetBatteryPercent?: number;
}): RoverChargePlan {
  const targetBatteryPercent = clamp(input.targetBatteryPercent ?? 100, input.rover.batteryPercent, 100);
  const addedBatteryPercent = roundTo(targetBatteryPercent - input.rover.batteryPercent, 2);
  const energyAddedKwh = roundTo((addedBatteryPercent / 100) * input.rover.batteryCapacityKwh, 4);
  const minutesPerPercent = input.chargerAvailable
    ? input.rules.chargerMinutesPerPercent
    : input.rules.fieldChargeMinutesPerPercent;
  return {
    currentBatteryPercent: input.rover.batteryPercent,
    targetBatteryPercent,
    addedBatteryPercent,
    energyAddedKwh,
    durationMinutes: roundTo(addedBatteryPercent * minutesPerPercent, 2),
    costCredits: roundTo(energyAddedKwh * input.rules.chargingCostCreditsPerKwh, 2),
    chargerAvailable: input.chargerAvailable,
  };
}
