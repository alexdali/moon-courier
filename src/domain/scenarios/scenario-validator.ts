import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioDefinition } from '@/domain/entities/scenario';
import { planRoute } from '@/domain/routing/route-planner';
import { evaluateDispatchFeasibility } from '@/domain/rules/feasibility';
import { isScenarioGraphConnected } from '@/domain/scenarios/graph-validator';

export interface ScenarioValidationCheck {
  code: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: unknown;
}

export interface ScenarioValidationReport {
  valid: boolean;
  checks: readonly ScenarioValidationCheck[];
  feasiblePairCount: number;
  impossibleOrderCodes: readonly string[];
}

export function validateScenario(scenario: ScenarioDefinition): ScenarioValidationReport {
  const checks: ScenarioValidationCheck[] = [];
  const ids = [
    ...scenario.world.nodes.map((item) => item.id),
    ...scenario.world.edges.map((item) => item.id),
    ...scenario.world.zones.map((item) => item.id),
    ...scenario.roverTemplates.map((item) => item.code),
    ...scenario.orderTemplates.map((item) => item.code),
  ];
  checks.push({
    code: 'UNIQUE_IDENTIFIERS',
    status: new Set(ids).size === ids.length ? 'pass' : 'fail',
    message: new Set(ids).size === ids.length ? 'All identifiers are unique' : 'Duplicate identifiers found',
  });
  const connected = isScenarioGraphConnected(scenario);
  checks.push({
    code: 'MAP_CONNECTED',
    status: connected ? 'pass' : 'fail',
    message: connected ? 'Map graph is connected' : 'Map contains unreachable nodes',
  });
  const nodeIds = new Set(scenario.world.nodes.map((node) => node.id));
  const referencesValid =
    scenario.world.edges.every((edge) => nodeIds.has(edge.fromNodeId) && nodeIds.has(edge.toNodeId)) &&
    scenario.roverTemplates.every((rover) => nodeIds.has(rover.startingNodeId)) &&
    scenario.orderTemplates.every(
      (order) => nodeIds.has(order.originNodeId) && nodeIds.has(order.destinationNodeId),
    );
  checks.push({
    code: 'REFERENCES_VALID',
    status: referencesValid ? 'pass' : 'fail',
    message: referencesValid ? 'All map references resolve' : 'One or more references are invalid',
  });
  const mission = fakeMission(scenario);
  const rovers = scenario.roverTemplates.map((template, index): Rover => ({
    id: `validation_rover_${index + 1}`,
    missionId: mission.id,
    code: template.code,
    name: template.name,
    status: template.startingStatus ?? 'available',
    nodeId: template.startingNodeId,
    batteryPercent: template.startingBatteryPercent,
    batteryCapacityKwh: template.batteryCapacityKwh,
    capacityKg: template.capacityKg,
    baseSpeedKph: template.baseSpeedKph,
    baseEnergyKwhPerKm: template.baseEnergyKwhPerKm,
    riskResistance: template.riskResistance,
    repairCostCredits: template.repairCostCredits,
    metadata: {},
  }));
  const orders = scenario.orderTemplates.map((template, index): DeliveryOrder => ({
    ...template,
    id: `validation_order_${index + 1}`,
    missionId: mission.id,
    status: 'pending',
    impossibleReason: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }));
  let feasiblePairCount = 0;
  const impossibleOrderCodes: string[] = [];
  for (const order of orders) {
    let orderFeasible = false;
    for (const rover of rovers) {
      const route = planRoute({ world: scenario.world, rover, order, objective: 'balanced' });
      const feasibility = evaluateDispatchFeasibility({
        order,
        rover,
        route,
        rules: scenario.rules,
        currentMinute: 0,
      });
      if (feasibility.status !== 'impossible') {
        feasiblePairCount += 1;
        orderFeasible = true;
      }
    }
    if (!orderFeasible) impossibleOrderCodes.push(order.code);
  }
  checks.push({
    code: 'HAS_FEASIBLE_DELIVERY',
    status: feasiblePairCount > 0 ? 'pass' : 'fail',
    message: feasiblePairCount > 0 ? `${feasiblePairCount} feasible assignments found` : 'No feasible assignment exists',
  });
  const impossibleRequired = scenario.rules.requireImpossibleOrder;
  checks.push({
    code: 'HAS_IMPOSSIBLE_ORDER',
    status: !impossibleRequired || impossibleOrderCodes.length > 0 ? 'pass' : 'fail',
    message:
      impossibleOrderCodes.length > 0
        ? `Impossible order(s): ${impossibleOrderCodes.join(', ')}`
        : 'No intentionally impossible order found',
  });
  const numericRangesValid =
    scenario.roverTemplates.every(
      (rover) =>
        rover.capacityKg > 0 &&
        rover.batteryCapacityKwh > 0 &&
        rover.startingBatteryPercent >= 0 &&
        rover.startingBatteryPercent <= 100 &&
        rover.baseSpeedKph > 0,
    ) &&
    scenario.orderTemplates.every((order) => order.weightKg > 0 && order.rewardCredits >= 0);
  checks.push({
    code: 'NUMERIC_RANGES',
    status: numericRangesValid ? 'pass' : 'fail',
    message: numericRangesValid ? 'Numeric values are within accepted ranges' : 'Invalid numeric values found',
  });
  const rulesValid =
    scenario.rules.durationDays > 0 &&
    scenario.rules.startingCredits >= 0 &&
    scenario.rules.targetCredits > 0 &&
    scenario.rules.minimumBatteryReservePercent >= 0 &&
    scenario.rules.minimumBatteryReservePercent < 100 &&
    scenario.rules.energyPriceCreditsPerKwh >= 0 &&
    scenario.rules.latePenaltyCreditsPerMinute >= 0 &&
    scenario.rules.riskDelayMinutes >= 0 &&
    scenario.rules.incidentBatteryLossPercent >= 0 &&
    scenario.rules.chargerMinutesPerPercent > 0 &&
    scenario.rules.fieldChargeMinutesPerPercent > 0 &&
    scenario.rules.chargingCostCreditsPerKwh >= 0 &&
    scenario.rules.repairDurationMinutes >= 0;
  checks.push({
    code: 'RULE_RANGES',
    status: rulesValid ? 'pass' : 'fail',
    message: rulesValid ? 'Scenario rules are within accepted ranges' : 'One or more scenario rules are invalid',
  });
  const maxCapacity = Math.max(...scenario.roverTemplates.map((rover) => rover.capacityKg), 0);
  const grossUpperBound = scenario.rules.startingCredits + scenario.orderTemplates
    .filter((order) => order.weightKg <= maxCapacity)
    .reduce((sum, order) => sum + order.rewardCredits, 0);
  const targetStructurallyReachable = scenario.rules.targetCredits <= grossUpperBound;
  checks.push({
    code: 'TARGET_GROSS_UPPER_BOUND',
    status: targetStructurallyReachable ? 'pass' : 'fail',
    message: targetStructurallyReachable
      ? `Target is below gross upper bound of ${grossUpperBound} credits`
      : `Target ${scenario.rules.targetCredits} exceeds gross upper bound ${grossUpperBound}`,
    details: { grossUpperBound },
  });
  return {
    valid: checks.every((check) => check.status !== 'fail'),
    checks,
    feasiblePairCount,
    impossibleOrderCodes,
  };
}

function fakeMission(scenario: ScenarioDefinition): Mission {
  return {
    id: 'validation_mission',
    scenarioId: scenario.id,
    name: scenario.name,
    status: 'active',
    currentMinute: 0,
    currentDay: 1,
    credits: scenario.rules.startingCredits,
    score: 0,
    rating: 100,
    targetCredits: scenario.rules.targetCredits,
    seed: scenario.seed,
    startedAt: null,
    endedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}
