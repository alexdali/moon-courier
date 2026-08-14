import { z } from 'zod';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { NotFoundError } from '@/domain/common/errors';
import { evaluateDispatchFeasibility } from '@/domain/rules/feasibility';
import { planRoute } from '@/domain/routing/route-planner';
import type { AiTool } from '@/modules/ai/tools/types';

const argsSchema = z.object({ orderId: z.string().min(1), roverId: z.string().min(1).optional() });
type Args = z.infer<typeof argsSchema>;

export class ExplainDispatchBlockersTool implements AiTool<Args> {
  readonly definition = {
    type: 'function' as const,
    function: {
      name: 'explain_dispatch_blockers',
      description: 'Explain exactly why an order-rover pair or an order across the whole fleet is feasible, risky or impossible.',
      parameters: {
        type: 'object', additionalProperties: false, required: ['orderId'],
        properties: { orderId: { type: 'string' }, roverId: { type: 'string' } },
      },
    },
  };
  constructor(private readonly repositories: RepositoryBundle) {}
  execute(rawArgs: Args, context: { missionId: string }) {
    const args = argsSchema.parse(rawArgs);
    const state = loadMissionState(this.repositories, context.missionId);
    const order = state.orders.find((item) => item.id === args.orderId);
    if (!order) throw new NotFoundError('Order', args.orderId);
    const rovers = args.roverId ? state.rovers.filter((item) => item.id === args.roverId) : state.rovers;
    if (args.roverId && rovers.length === 0) throw new NotFoundError('Rover', args.roverId);
    const evaluations = rovers.map((rover) => {
      const route = planRoute({ world: state.scenario.world, rover, order, objective: 'balanced' });
      const feasibility = evaluateDispatchFeasibility({ order, rover, route, rules: state.scenario.rules, currentMinute: state.mission.currentMinute });
      return { roverId: rover.id, roverCode: rover.code, feasibility, route: route ? {
        distanceKm: route.distanceKm, durationMinutes: route.durationMinutes, risk: route.incidentRisk,
      } : null };
    });
    const feasible = evaluations.filter((item) => item.feasibility.status !== 'impossible');
    const summary = feasible.length > 0
      ? `${order.code} is feasible with ${feasible.map((item) => item.roverCode).join(', ')}; ${evaluations.length - feasible.length} rover(s) are blocked.`
      : `${order.code} is impossible with every available rover: ${evaluations.flatMap((item) => item.feasibility.blockingReasons.map((reason) => `${item.roverCode}: ${reason.message}`)).join('; ')}`;
    return { data: { order: { id: order.id, code: order.code, weightKg: order.weightKg, impossibleReason: order.impossibleReason }, evaluations }, summary };
  }
}
