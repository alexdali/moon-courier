import type { MissionDashboardDto } from '@/application/dto/mission-dashboard';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { getEnv } from '@/config/env';
import { getFeatureFlags } from '@/config/feature-flags';
import { evaluateMissionGoal } from '@/domain/rules/mission-goal';

export class GetMissionDashboardUseCase {
  constructor(private readonly repositories: RepositoryBundle) {}
  execute(missionId?: string): MissionDashboardDto {
    const state = loadMissionState(this.repositories, missionId);
    const env = getEnv();
    const flags = getFeatureFlags();
    return {
      mission: state.mission,
      scenario: {
        id: state.scenario.id,
        name: state.scenario.name,
        description: state.scenario.description,
        difficulty: state.scenario.difficulty,
        durationDays: state.scenario.rules.durationDays,
        minimumBatteryReservePercent: state.scenario.rules.minimumBatteryReservePercent,
      },
      world: state.scenario.world,
      rovers: state.rovers,
      orders: state.orders,
      events: state.events,
      goal: evaluateMissionGoal(state.mission, state.orders, state.scenario.rules),
      ai: {
        enabled: flags.aiEnabled,
        primaryModel: env.AI_PRIMARY_MODEL,
        fallbackModel: env.AI_FALLBACK_MODEL,
        mode: flags.aiEnabled ? 'online' : 'offline',
      },
    };
  }
}
