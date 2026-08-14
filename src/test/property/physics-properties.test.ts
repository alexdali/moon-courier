import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { calculateSegmentEnergyKwh } from '@/domain/rules/energy';
import { calculateSegmentIncidentRisk } from '@/domain/rules/risk';
import { calculateEffectiveSpeedKph } from '@/domain/rules/speed';

describe('physics monotonic properties', () => {
  it('never reduces energy when distance or load increases', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 1.5, noNaN: true }),
        fc.double({ min: 0, max: 1.5, noNaN: true }),
        (distance, loadA, extraLoad) => {
          const loadB = Math.min(2, loadA + extraLoad);
          const base = {
            baseEnergyKwhPerKm: 0.45,
            edgeEnergyFactor: 1.1,
            zoneEnergyMultiplier: 1.05,
          };
          const lighter = calculateSegmentEnergyKwh({ ...base, distanceKm: distance, loadRatio: loadA });
          const heavier = calculateSegmentEnergyKwh({ ...base, distanceKm: distance, loadRatio: loadB });
          const longer = calculateSegmentEnergyKwh({ ...base, distanceKm: distance + 1, loadRatio: loadA });
          expect(heavier).toBeGreaterThanOrEqual(lighter);
          expect(longer).toBeGreaterThanOrEqual(lighter);
        },
      ),
      { numRuns: 300 },
    );
  });

  it('never increases effective speed when load increases', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 5, max: 80, noNaN: true }),
        fc.double({ min: 0, max: 1.2, noNaN: true }),
        fc.double({ min: 0, max: 0.3, noNaN: true }),
        (baseSpeedKph, loadA, extraLoad) => {
          const loadB = Math.min(1.5, loadA + extraLoad);
          const first = calculateEffectiveSpeedKph({
            baseSpeedKph,
            edgeSpeedFactor: 0.9,
            zoneSpeedMultiplier: 0.85,
            loadRatio: loadA,
          });
          const second = calculateEffectiveSpeedKph({
            baseSpeedKph,
            edgeSpeedFactor: 0.9,
            zoneSpeedMultiplier: 0.85,
            loadRatio: loadB,
          });
          expect(second).toBeLessThanOrEqual(first);
          expect(second).toBeGreaterThanOrEqual(1);
        },
      ),
      { numRuns: 300 },
    );
  });

  it('keeps risk bounded and lowers it with stronger rover resistance', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 0.6, noNaN: true }),
        fc.double({ min: 0.5, max: 2.5, noNaN: true }),
        fc.double({ min: 0, max: 2, noNaN: true }),
        fc.double({ min: 0, max: 0.8, noNaN: true }),
        fc.double({ min: 0, max: 0.2, noNaN: true }),
        (baseRisk, zoneRiskMultiplier, loadRatio, resistanceA, extraResistance) => {
          const resistanceB = Math.min(1, resistanceA + extraResistance);
          const first = calculateSegmentIncidentRisk({ baseRisk, zoneRiskMultiplier, loadRatio, roverRiskResistance: resistanceA });
          const second = calculateSegmentIncidentRisk({ baseRisk, zoneRiskMultiplier, loadRatio, roverRiskResistance: resistanceB });
          expect(first).toBeGreaterThanOrEqual(0);
          expect(first).toBeLessThanOrEqual(0.95);
          expect(second).toBeLessThanOrEqual(first);
        },
      ),
      { numRuns: 300 },
    );
  });
});
