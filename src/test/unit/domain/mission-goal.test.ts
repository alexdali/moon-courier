import { describe, expect, it } from 'vitest';
import { createFixtureState } from '@/test/helpers/fixture-state';
import { evaluateMissionGoal } from '@/domain/rules/mission-goal';

describe('mission goal', () => {
  it('wins on target and loses after duration', () => {
    const state = createFixtureState();
    expect(evaluateMissionGoal({ ...state.mission, credits: state.mission.targetCredits }, state.orders, state.scenario.rules).state).toBe('won');
    expect(evaluateMissionGoal({ ...state.mission, currentDay: state.scenario.rules.durationDays + 1 }, state.orders, state.scenario.rules).state).toBe('lost');
  });
});
