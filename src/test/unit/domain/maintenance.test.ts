import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { resolveRoverRepair } from '@/domain/simulation/rover-repairer';

describe('maintenance', () => {
  it('repairs a damaged rover and charges credits/time', () => {
    const state = createFixtureState();
    const rover = { ...state.rovers[0]!, status: 'damaged' as const };
    const result = resolveRoverRepair({ mission: state.mission, rover, rules: state.scenario.rules, sequence: 1, occurredAt: '2026-08-15T00:00:00.000Z' });
    expect(result.roverAfter.status).toBe('available');
    expect(result.missionAfter.currentMinute).toBeGreaterThan(0);
    expect(result.economyEntry.amountCredits).toBeLessThan(0);
  });
});
