import type { DeliveryOrder } from '@/domain/entities/order';
import type { Mission } from '@/domain/entities/mission';
import type { ScenarioRules } from '@/domain/entities/scenario';

export interface MissionGoalStatus {
  state: 'in_progress' | 'won' | 'lost';
  reason: string;
  progressPercent: number;
}

export function evaluateMissionGoal(
  mission: Mission,
  orders: readonly DeliveryOrder[],
  rules: ScenarioRules,
): MissionGoalStatus {
  const progressPercent = Math.min(100, Math.max(0, (mission.credits / Math.max(1, mission.targetCredits)) * 100));
  if (mission.credits >= mission.targetCredits) {
    return { state: 'won', reason: 'Target credits reached', progressPercent };
  }
  if (mission.currentDay > rules.durationDays || mission.credits < 0) {
    return {
      state: 'lost',
      reason: mission.credits < 0 ? 'Base is bankrupt' : 'Mission duration expired',
      progressPercent,
    };
  }
  if (orders.every((order) => ['delivered', 'failed', 'expired', 'blocked'].includes(order.status))) {
    return {
      state: mission.credits >= mission.targetCredits ? 'won' : 'lost',
      reason: 'No active orders remain',
      progressPercent,
    };
  }
  return { state: 'in_progress', reason: 'Mission continues', progressPercent };
}
