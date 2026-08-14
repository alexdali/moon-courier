import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { calculateRoverChargePlan } from '@/domain/rules/charging';
import { resolveRoverCharge } from '@/domain/simulation/rover-charger';

describe('charging', () => {
  it('charges faster at a charger and persists time/cost consequences', () => {
    const state = createFixtureState();
    const rover = state.rovers[0]!;
    const station = calculateRoverChargePlan({ rover, rules: state.scenario.rules, chargerAvailable: true });
    const field = calculateRoverChargePlan({ rover, rules: state.scenario.rules, chargerAvailable: false });
    expect(station.durationMinutes).toBeLessThan(field.durationMinutes);
    const result = resolveRoverCharge({ mission: state.mission, scenario: state.scenario, rover, sequence: 1, occurredAt: '2026-08-15T00:00:00.000Z' });
    expect(result.roverAfter.batteryPercent).toBe(100);
    expect(result.missionAfter.credits).toBeLessThan(state.mission.credits);
  });
});
