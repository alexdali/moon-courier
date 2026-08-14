import { roundTo } from '@/domain/common/math';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { PlannedRoute } from '@/domain/entities/delivery';
import type { ScenarioRules } from '@/domain/entities/scenario';

export interface EconomyEstimate {
  grossRewardCredits: number;
  energyCostCredits: number;
  expectedRiskLossCredits: number;
  expectedLatePenaltyCredits: number;
  expectedNetCredits: number;
}

export function estimateDeliveryEconomy(input: {
  order: DeliveryOrder;
  route: PlannedRoute;
  rules: ScenarioRules;
  currentMinute: number;
}): EconomyEstimate {
  const arrivalMinute = input.currentMinute + input.route.durationMinutes;
  const lateMinutes = input.order.deadlineMinute === null ? 0 : Math.max(0, arrivalMinute - input.order.deadlineMinute);
  const energyCostCredits = input.route.energyKwh * input.rules.energyPriceCreditsPerKwh;
  const expectedRiskLossCredits =
    input.route.failureRisk * (input.order.failurePenaltyCredits + input.order.rewardCredits);
  const expectedLatePenaltyCredits = lateMinutes * input.rules.latePenaltyCreditsPerMinute;
  return {
    grossRewardCredits: input.order.rewardCredits,
    energyCostCredits: roundTo(energyCostCredits, 2),
    expectedRiskLossCredits: roundTo(expectedRiskLossCredits, 2),
    expectedLatePenaltyCredits: roundTo(expectedLatePenaltyCredits, 2),
    expectedNetCredits: roundTo(
      input.order.rewardCredits - energyCostCredits - expectedRiskLossCredits - expectedLatePenaltyCredits,
      2,
    ),
  };
}
