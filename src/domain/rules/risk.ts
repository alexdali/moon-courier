import { clamp, roundTo } from '@/domain/common/math';

export function calculateSegmentIncidentRisk(input: {
  baseRisk: number;
  zoneRiskMultiplier: number;
  loadRatio: number;
  roverRiskResistance: number;
}): number {
  const loadMultiplier = 1 + 0.25 * clamp(input.loadRatio, 0, 2);
  const resistanceMultiplier = 1 - 0.45 * clamp(input.roverRiskResistance, 0, 1);
  return roundTo(
    clamp(input.baseRisk * input.zoneRiskMultiplier * loadMultiplier * resistanceMultiplier, 0, 0.95),
    5,
  );
}

export function incidentRiskToFailureRisk(incidentRisk: number): number {
  return roundTo(clamp(incidentRisk * 0.35, 0, 0.8), 5);
}

export function combineIndependentRisks(risks: readonly number[]): number {
  const survival = risks.reduce((probability, risk) => probability * (1 - clamp(risk, 0, 1)), 1);
  return roundTo(1 - survival, 5);
}
