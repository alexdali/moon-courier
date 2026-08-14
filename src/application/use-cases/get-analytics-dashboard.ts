import type { AnalyticsDashboardDto } from '@/application/dto/analytics-dashboard';
import type { Clock } from '@/application/ports/clock';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { applyCounterfactual, counterfactualLabels, type CounterfactualKey } from '@/domain/analytics/counterfactual';
import { buildEconomyTimeline } from '@/domain/analytics/economy-timeline';
import { createAnalyticsEvidence } from '@/domain/analytics/evidence';
import { buildFailureBreakdown } from '@/domain/analytics/failure-breakdown';
import { calculateMissionKpis } from '@/domain/analytics/mission-kpis';
import { calculateRoverUtilization } from '@/domain/analytics/rover-utilization';
import { safeBalancedPolicy } from '@/domain/planning/policies';
import { runMonteCarlo } from '@/domain/simulation/mission-simulator';

export class GetAnalyticsDashboardUseCase {
  constructor(private readonly repositories: RepositoryBundle, private readonly clock: Clock) {}
  execute(missionId?: string, iterations = 80): AnalyticsDashboardDto {
    const state = loadMissionState(this.repositories, missionId);
    const roverUtilization = calculateRoverUtilization({
      rovers: state.rovers,
      deliveries: state.deliveries,
      missionElapsedMinutes: state.mission.currentMinute,
    });
    const kpis = calculateMissionKpis({
      mission: state.mission,
      orders: state.orders,
      deliveries: state.deliveries,
      roverUtilization,
      startingCredits: state.scenario.rules.startingCredits,
    });
    const keys: readonly CounterfactualKey[] = ['baseline', 'extra-heavy-rover', 'faster-charging'];
    const comparison = keys.map((key) => ({
      key,
      label: counterfactualLabels[key],
      summary: runMonteCarlo({
        scenario: applyCounterfactual(state.scenario, key),
        policy: safeBalancedPolicy,
        iterations,
        seed: state.scenario.seed,
      }).summary,
    }));
    return {
      kpis,
      economy: buildEconomyTimeline(state.economy),
      failures: buildFailureBreakdown({ deliveries: state.deliveries, orders: state.orders }),
      roverUtilization,
      comparison,
      evidence: createAnalyticsEvidence({
        eventCount: state.events.length,
        deliveryCount: state.deliveries.length,
        simulationIterations: iterations * keys.length,
        generatedAt: this.clock.now(),
      }),
    };
  }
}
