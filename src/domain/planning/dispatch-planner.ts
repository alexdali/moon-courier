import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioDefinition } from '@/domain/entities/scenario';
import { estimateDeliveryEconomy } from '@/domain/rules/economy';
import { evaluateDispatchFeasibility } from '@/domain/rules/feasibility';
import { planRoute } from '@/domain/routing/route-planner';
import type { DispatchCandidate } from '@/domain/planning/candidate';
import { scoreDispatchCandidate } from '@/domain/planning/score';
import { defaultDispatchConstraints, type DispatchConstraints } from '@/domain/planning/constraints';

export function buildDispatchCandidates(input: {
  mission: Mission;
  scenario: ScenarioDefinition;
  orders: readonly DeliveryOrder[];
  rovers: readonly Rover[];
  constraints?: DispatchConstraints;
}): readonly DispatchCandidate[] {
  const constraints = input.constraints ?? defaultDispatchConstraints;
  const candidates: DispatchCandidate[] = [];
  for (const order of input.orders.filter((item) => item.status === 'pending')) {
    for (const rover of input.rovers) {
      if (constraints.excludedRoverCodes.includes(rover.code)) continue;
      const route = planRoute({
        world: input.scenario.world,
        rover,
        order,
        objective: constraints.preferredObjective,
      });
      let feasibility = evaluateDispatchFeasibility({
        order,
        rover,
        route,
        rules: {
          ...input.scenario.rules,
          minimumBatteryReservePercent: Math.max(
            input.scenario.rules.minimumBatteryReservePercent,
            constraints.minimumBatteryReservePercent,
          ),
        },
        currentMinute: input.mission.currentMinute,
      });
      if (route && constraints.maximumIncidentRisk !== null && route.incidentRisk > constraints.maximumIncidentRisk) {
        feasibility = {
          ...feasibility,
          warnings: [
            ...feasibility.warnings,
            {
              code: 'CARGO_DAMAGED',
              message: `Route exceeds requested risk limit of ${Math.round(constraints.maximumIncidentRisk * 100)}%`,
              actual: route.incidentRisk,
            },
          ],
        };
      }
      const economy = route
        ? estimateDeliveryEconomy({
            order,
            route,
            rules: input.scenario.rules,
            currentMinute: input.mission.currentMinute,
          })
        : null;
      const base = { order, rover, route, feasibility, economy };
      candidates.push({ ...base, ...scoreDispatchCandidate(base, constraints) });
    }
  }
  return candidates.sort((left, right) => right.score - left.score);
}

export function recommendDispatch(input: Parameters<typeof buildDispatchCandidates>[0]): DispatchCandidate | null {
  return buildDispatchCandidates(input).find((candidate) => Number.isFinite(candidate.score)) ?? null;
}
