import type { DispatchPreviewDto } from '@/application/dto/dispatch-preview';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { NotFoundError } from '@/domain/common/errors';
import type { RouteObjective } from '@/domain/entities/delivery';
import { estimateDeliveryEconomy } from '@/domain/rules/economy';
import { evaluateDispatchFeasibility } from '@/domain/rules/feasibility';
import { planRoute } from '@/domain/routing/route-planner';

export class PreviewDispatchUseCase {
  constructor(private readonly repositories: RepositoryBundle) {}
  execute(input: { missionId?: string; orderId: string; roverId: string; objective?: RouteObjective }): DispatchPreviewDto {
    const state = loadMissionState(this.repositories, input.missionId);
    const order = state.orders.find((item) => item.id === input.orderId);
    const rover = state.rovers.find((item) => item.id === input.roverId);
    if (!order) throw new NotFoundError('Order', input.orderId);
    if (!rover) throw new NotFoundError('Rover', input.roverId);
    const route = planRoute({ world: state.scenario.world, rover, order, objective: input.objective ?? 'balanced' });
    const feasibility = evaluateDispatchFeasibility({
      order, rover, route, rules: state.scenario.rules, currentMinute: state.mission.currentMinute,
    });
    const economy = route ? estimateDeliveryEconomy({ order, route, rules: state.scenario.rules, currentMinute: state.mission.currentMinute }) : null;
    return {
      missionId: state.mission.id,
      orderId: order.id,
      roverId: rover.id,
      orderCode: order.code,
      roverCode: rover.code,
      route,
      feasibility,
      economy,
      successProbability: route ? 1 - route.failureRisk : 0,
    };
  }
}
