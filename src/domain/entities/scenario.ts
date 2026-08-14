import type { ScenarioId } from '@/domain/common/ids';
import type { OrderTemplate } from '@/domain/entities/order';
import type { RoverTemplate } from '@/domain/entities/rover';
import type { WorldMap } from '@/domain/entities/world';

export type ScenarioDifficulty = 'easy' | 'normal' | 'hard' | 'crisis';
export type ScenarioSource = 'fixture' | 'manual' | 'ai';

export interface ScenarioRules {
  durationDays: number;
  startingCredits: number;
  targetCredits: number;
  minimumBatteryReservePercent: number;
  energyPriceCreditsPerKwh: number;
  latePenaltyCreditsPerMinute: number;
  riskDelayMinutes: number;
  incidentBatteryLossPercent: number;
  chargerMinutesPerPercent: number;
  fieldChargeMinutesPerPercent: number;
  chargingCostCreditsPerKwh: number;
  repairDurationMinutes: number;
  requireImpossibleOrder: boolean;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  seed: number;
  difficulty: ScenarioDifficulty;
  source: ScenarioSource;
  rules: ScenarioRules;
  world: WorldMap;
  roverTemplates: readonly RoverTemplate[];
  orderTemplates: readonly OrderTemplate[];
}
