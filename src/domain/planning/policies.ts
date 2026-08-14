import type { SimulationPolicy } from '@/domain/entities/simulation';
import type { DispatchConstraints } from '@/domain/planning/constraints';

export const safeBalancedPolicy: SimulationPolicy = {
  name: 'safe-balanced',
  prioritizeUrgencies: ['critical', 'high', 'normal', 'low'],
  minimumBatteryReservePercent: 15,
  riskTolerance: 'low',
  objective: 'balanced',
};

export function policyToConstraints(policy: SimulationPolicy): DispatchConstraints {
  const riskByTolerance = { low: 0.2, medium: 0.35, high: null } as const;
  const objectiveByPolicy = {
    profit: 'efficient',
    safety: 'safest',
    speed: 'fastest',
    balanced: 'balanced',
  } as const;
  return {
    prioritizeUrgencies: policy.prioritizeUrgencies,
    minimumBatteryReservePercent: policy.minimumBatteryReservePercent,
    maximumIncidentRisk: riskByTolerance[policy.riskTolerance],
    excludedRoverCodes: [],
    preferredObjective: objectiveByPolicy[policy.objective],
    prioritizeProfit: policy.objective === 'profit',
  };
}
