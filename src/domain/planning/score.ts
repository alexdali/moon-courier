import { clamp, roundTo } from '@/domain/common/math';
import type { DispatchCandidate } from '@/domain/planning/candidate';
import type { DispatchConstraints } from '@/domain/planning/constraints';

const urgencyScore = { critical: 400, high: 250, normal: 100, low: 40 } as const;

export function scoreDispatchCandidate(
  candidate: Omit<DispatchCandidate, 'score' | 'rankReasons'>,
  constraints: DispatchConstraints,
): Pick<DispatchCandidate, 'score' | 'rankReasons'> {
  if (candidate.feasibility.status === 'impossible' || !candidate.route || !candidate.economy) {
    return { score: Number.NEGATIVE_INFINITY, rankReasons: ['Not feasible'] };
  }
  const urgencyRank = constraints.prioritizeUrgencies.indexOf(candidate.order.urgency);
  const priorityBonus = urgencyRank < 0 ? 0 : (constraints.prioritizeUrgencies.length - urgencyRank) * 60;
  const profitValue = candidate.economy.expectedNetCredits;
  const safetyValue = (1 - candidate.route.failureRisk) * 200;
  const speedValue = 120 / Math.max(10, candidate.route.durationMinutes);
  const reserveValue = clamp(candidate.feasibility.batteryAfterPercent, 0, 100) * 1.2;
  const score =
    urgencyScore[candidate.order.urgency] +
    priorityBonus +
    profitValue * (constraints.prioritizeProfit ? 1.6 : 0.8) +
    safetyValue +
    speedValue +
    reserveValue;
  return {
    score: roundTo(score, 3),
    rankReasons: [
      `${candidate.order.urgency} urgency`,
      `${Math.round((1 - candidate.route.failureRisk) * 100)}% projected success`,
      `${candidate.economy.expectedNetCredits} expected net credits`,
      `${candidate.feasibility.batteryAfterPercent}% battery after delivery`,
    ],
  };
}
