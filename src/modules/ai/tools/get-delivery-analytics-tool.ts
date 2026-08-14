import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { buildEconomyTimeline } from '@/domain/analytics/economy-timeline';
import { buildFailureBreakdown } from '@/domain/analytics/failure-breakdown';
import { calculateRoverUtilization } from '@/domain/analytics/rover-utilization';
import { calculateMissionKpis } from '@/domain/analytics/mission-kpis';
import type { AiTool } from '@/modules/ai/tools/types';

export class GetDeliveryAnalyticsTool implements AiTool<Record<string, never>> {
  readonly definition = {
    type: 'function' as const,
    function: {
      name: 'get_delivery_analytics',
      description: 'Return computed KPIs, economy timeline, failure reasons and rover utilization for the current mission.',
      parameters: { type: 'object', additionalProperties: false, properties: {} },
    },
  };
  constructor(private readonly repositories: RepositoryBundle) {}
  execute(_args: Record<string, never>, context: { missionId: string }) {
    const state = loadMissionState(this.repositories, context.missionId);
    const roverUtilization = calculateRoverUtilization({ rovers: state.rovers, deliveries: state.deliveries, missionElapsedMinutes: state.mission.currentMinute });
    const kpis = calculateMissionKpis({ mission: state.mission, orders: state.orders, deliveries: state.deliveries, roverUtilization, startingCredits: state.scenario.rules.startingCredits });
    const data = { kpis, economy: buildEconomyTimeline(state.economy), failures: buildFailureBreakdown({ deliveries: state.deliveries, orders: state.orders }), roverUtilization };
    return { data, summary: `Net change ${kpis.netChange.toFixed(0)} CR; completion ${Math.round(kpis.completionRate * 100)}%; ${kpis.failedDeliveries} failed deliveries.` };
  }
}
