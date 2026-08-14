import { describe, expect, it } from 'vitest';
import { calculateSegmentIncidentRisk, combineIndependentRisks, incidentRiskToFailureRisk } from '@/domain/rules/risk';

describe('risk rules', () => {
  it('keeps probabilities bounded and combines them independently', () => {
    const risk = calculateSegmentIncidentRisk({ baseRisk: .2, zoneRiskMultiplier: 1.5, loadRatio: 1, roverRiskResistance: .4 });
    expect(risk).toBeGreaterThan(0);
    expect(risk).toBeLessThan(1);
    expect(incidentRiskToFailureRisk(risk)).toBeLessThanOrEqual(risk);
    expect(combineIndependentRisks([.1, .2])).toBeCloseTo(.28, 4);
  });
});
