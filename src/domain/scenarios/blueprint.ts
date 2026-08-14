import type { ScenarioDifficulty } from '@/domain/entities/scenario';
import type { NodeKind, TerrainKind } from '@/domain/entities/world';
import type { OrderUrgency } from '@/domain/entities/order';

export interface ScenarioBlueprintSite {
  code: string;
  name: string;
  kind: NodeKind;
  x: number;
  y: number;
  environment: TerrainKind;
  hasCharger: boolean;
}

export interface ScenarioBlueprintRover {
  code: string;
  name: string;
  capacityKg: number;
  batteryCapacityKwh: number;
  startingBatteryPercent: number;
  baseSpeedKph: number;
  riskResistance: number;
}

export interface ScenarioBlueprintOrder {
  code: string;
  title: string;
  category: string;
  destinationSiteCode: string;
  weightKg: number;
  rewardCredits: number;
  failurePenaltyCredits: number;
  urgency: OrderUrgency;
  deadlineMinute: number | null;
}

export interface ScenarioBlueprint {
  title: string;
  summary: string;
  seed: number;
  durationDays: number;
  difficulty: ScenarioDifficulty;
  startingCredits: number;
  targetCredits: number;
  sites: readonly ScenarioBlueprintSite[];
  rovers: readonly ScenarioBlueprintRover[];
  orders: readonly ScenarioBlueprintOrder[];
  demandNarrative: string;
  victoryNarrative: string;
}
