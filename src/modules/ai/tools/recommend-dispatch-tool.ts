import { z } from 'zod';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { recommendDispatch } from '@/domain/planning/dispatch-planner';
import type { AiTool } from '@/modules/ai/tools/types';

const argsSchema = z.object({
  minimumBatteryReservePercent: z.number().min(0).max(80).default(15),
  riskTolerance: z.enum(['low', 'medium', 'high']).default('medium'),
  prioritizeUrgency: z.array(z.enum(['critical', 'high', 'normal', 'low'])).default(['critical', 'high', 'normal', 'low']),
  objective: z.enum(['balanced', 'fastest', 'safest', 'efficient']).default('balanced'),
  excludedRoverCodes: z.array(z.string()).default([]),
});

type Args = z.infer<typeof argsSchema>;

export class RecommendDispatchTool implements AiTool<Args> {
  readonly definition = {
    type: 'function' as const,
    function: {
      name: 'recommend_dispatch',
      description: 'Find the best currently feasible order-rover assignment using deterministic routing, energy, risk and economy calculations.',
      parameters: {
        type: 'object', additionalProperties: false,
        properties: {
          minimumBatteryReservePercent: { type: 'number', minimum: 0, maximum: 80 },
          riskTolerance: { type: 'string', enum: ['low', 'medium', 'high'] },
          prioritizeUrgency: { type: 'array', items: { type: 'string', enum: ['critical', 'high', 'normal', 'low'] } },
          objective: { type: 'string', enum: ['balanced', 'fastest', 'safest', 'efficient'] },
          excludedRoverCodes: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  };
  constructor(private readonly repositories: RepositoryBundle) {}
  execute(rawArgs: Args, context: { missionId: string }) {
    const args = argsSchema.parse(rawArgs);
    const state = loadMissionState(this.repositories, context.missionId);
    const maximumIncidentRisk = args.riskTolerance === 'low' ? 0.2 : args.riskTolerance === 'medium' ? 0.35 : null;
    const candidate = recommendDispatch({
      mission: state.mission, scenario: state.scenario, orders: state.orders, rovers: state.rovers,
      constraints: {
        prioritizeUrgencies: args.prioritizeUrgency,
        minimumBatteryReservePercent: args.minimumBatteryReservePercent,
        maximumIncidentRisk,
        excludedRoverCodes: args.excludedRoverCodes,
        preferredObjective: args.objective,
        prioritizeProfit: args.objective === 'efficient',
      },
    });
    if (!candidate || !candidate.route || !candidate.economy) {
      return { data: { recommendation: null }, summary: 'No feasible assignment satisfies the requested constraints.' };
    }
    const data = {
      orderId: candidate.order.id, orderCode: candidate.order.code,
      roverId: candidate.rover.id, roverCode: candidate.rover.code,
      feasibility: candidate.feasibility,
      route: {
        distanceKm: candidate.route.distanceKm,
        durationMinutes: candidate.route.durationMinutes,
        incidentRisk: candidate.route.incidentRisk,
        failureRisk: candidate.route.failureRisk,
        energyKwh: candidate.route.energyKwh,
      },
      economy: candidate.economy,
      score: candidate.score,
      rankReasons: candidate.rankReasons,
    };
    return {
      data,
      summary: `${candidate.order.code} → ${candidate.rover.code}; ${candidate.route.durationMinutes.toFixed(1)} min; battery after ${candidate.feasibility.batteryAfterPercent.toFixed(1)}%; expected net ${candidate.economy.expectedNetCredits.toFixed(0)} CR.`,
      suggestedSelection: { orderId: candidate.order.id, roverId: candidate.rover.id },
    };
  }
}
