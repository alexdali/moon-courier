import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { evaluateMissionGoal } from '@/domain/rules/mission-goal';
import type { AiTool } from '@/modules/ai/tools/types';

export class GetMissionSummaryTool implements AiTool<Record<string, never>> {
  readonly definition = {
    type: 'function' as const,
    function: {
      name: 'get_mission_summary',
      description: 'Return current mission economy, progress, fleet state, order status counts and recent events.',
      parameters: { type: 'object', additionalProperties: false, properties: {} },
    },
  };
  constructor(private readonly repositories: RepositoryBundle) {}
  execute(_args: Record<string, never>, context: { missionId: string }) {
    const state = loadMissionState(this.repositories, context.missionId);
    const statusCounts = Object.fromEntries(['pending', 'delivered', 'failed', 'blocked'].map((status) => [status, state.orders.filter((order) => order.status === status || (status === 'blocked' && order.impossibleReason)).length]));
    const data = {
      mission: state.mission,
      goal: evaluateMissionGoal(state.mission, state.orders, state.scenario.rules),
      statusCounts,
      fleet: state.rovers.map((rover) => ({ code: rover.code, status: rover.status, batteryPercent: rover.batteryPercent, capacityKg: rover.capacityKg })),
      recentEvents: state.events.slice(-8).map((event) => ({ sequence: event.sequence, type: event.type, message: event.message })),
    };
    return { data, summary: `Balance ${state.mission.credits.toFixed(0)} / ${state.mission.targetCredits.toFixed(0)} CR; ${statusCounts.delivered ?? 0} delivered, ${statusCounts.failed ?? 0} failed, ${statusCounts.pending ?? 0} pending.` };
  }
}
