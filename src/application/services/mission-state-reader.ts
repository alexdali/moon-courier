import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { NotFoundError } from '@/domain/common/errors';

export function loadMissionState(repositories: RepositoryBundle, missionId?: string) {
  const mission = missionId ? repositories.missions.getById(missionId) : repositories.missions.getCurrent();
  if (!mission) throw new NotFoundError('Mission', missionId ?? 'current');
  const scenario = repositories.scenarios.getById(mission.scenarioId);
  if (!scenario) throw new NotFoundError('Scenario', mission.scenarioId);
  return {
    mission,
    scenario,
    rovers: repositories.rovers.listByMission(mission.id),
    orders: repositories.orders.listByMission(mission.id),
    deliveries: repositories.deliveries.listByMission(mission.id),
    events: repositories.events.listByMission(mission.id),
    economy: repositories.economy.listByMission(mission.id),
  };
}
