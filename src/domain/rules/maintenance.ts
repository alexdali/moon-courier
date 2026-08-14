import type { Rover } from '@/domain/entities/rover';
import type { ScenarioRules } from '@/domain/entities/scenario';

export interface RoverRepairPlan {
  durationMinutes: number;
  costCredits: number;
  restoredStatus: 'available';
}

export function calculateRoverRepairPlan(rover: Rover, rules: ScenarioRules): RoverRepairPlan {
  if (rover.status !== 'damaged') throw new Error(`Rover ${rover.code} is not damaged`);
  return {
    durationMinutes: rules.repairDurationMinutes,
    costCredits: rover.repairCostCredits,
    restoredStatus: 'available',
  };
}
