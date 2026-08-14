import type { MissionId, ScenarioId, SimulationRunId } from '@/domain/common/ids';

export type SimulationKind = 'balance-check' | 'counterfactual' | 'benchmark';
export type SimulationStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface SimulationPolicy {
  name: string;
  prioritizeUrgencies: readonly ('critical' | 'high' | 'normal' | 'low')[];
  minimumBatteryReservePercent: number;
  riskTolerance: 'low' | 'medium' | 'high';
  objective: 'profit' | 'safety' | 'speed' | 'balanced';
}

export interface SimulationSample {
  seed: number;
  finalCredits: number;
  deliveredOrders: number;
  failedDeliveries: number;
  expiredOrders: number;
  success: boolean;
}

export interface SimulationSummary {
  iterations: number;
  successRate: number;
  bankruptcyRate: number;
  meanFinalCredits: number;
  medianFinalCredits: number;
  p10FinalCredits: number;
  p90FinalCredits: number;
  meanCompletionRate: number;
  meanFailedDeliveries: number;
}

export interface SimulationRun {
  id: SimulationRunId;
  missionId: MissionId | null;
  scenarioId: ScenarioId;
  kind: SimulationKind;
  policy: SimulationPolicy;
  seed: number;
  iterations: number;
  status: SimulationStatus;
  summary: SimulationSummary | null;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}
