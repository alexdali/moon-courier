import { buildDispatchCandidates } from '@/domain/planning/dispatch-planner';
import { policyToConstraints, safeBalancedPolicy } from '@/domain/planning/policies';
import { calculateSegmentEnergyKwh } from '@/domain/rules/energy';
import { evaluateDispatchFeasibility } from '@/domain/rules/feasibility';
import { calculateSegmentIncidentRisk } from '@/domain/rules/risk';
import { calculateEffectiveSpeedKph } from '@/domain/rules/speed';
import { planRoute } from '@/domain/routing/route-planner';
import { validateScenario } from '@/domain/scenarios/scenario-validator';
import { resolveDelivery } from '@/domain/simulation/delivery-resolver';
import { createInMemoryMission } from '@/domain/simulation/mission-factory';
import { createDemoScenario } from '@/fixtures/demo-scenario';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const scenario = createDemoScenario();
const validation = validateScenario(scenario);
assert(validation.valid, `Demo scenario validation failed: ${JSON.stringify(validation.checks, null, 2)}`);
assert(validation.impossibleOrderCodes.includes('HAB-021'), 'Required impossible order HAB-021 was not detected');
assert(validation.feasiblePairCount >= 1, 'Demo scenario has no feasible rover/order pair');

const state = createInMemoryMission(scenario, 'validation');
const candidates = buildDispatchCandidates({
  mission: state.mission,
  scenario,
  rovers: state.rovers,
  orders: state.orders,
  constraints: policyToConstraints(safeBalancedPolicy),
});
const ready = candidates.filter((candidate) => candidate.feasibility.status !== 'impossible');
assert(ready.length >= 1, 'Dispatch planner produced no valid candidate');

const atlas = state.rovers.find((rover) => rover.code === 'ATLAS-1');
const medical = state.orders.find((order) => order.code === 'MED-017');
const impossible = state.orders.find((order) => order.code === 'HAB-021');
assert(atlas && medical && impossible, 'Demo fixtures are incomplete');

for (const batteryPercent of [0, 25, 100]) {
  const rover = { ...atlas, batteryPercent };
  const route = planRoute({ world: scenario.world, rover, order: impossible, objective: 'balanced' });
  const feasibility = evaluateDispatchFeasibility({
    order: impossible,
    rover,
    route,
    rules: scenario.rules,
    currentMinute: state.mission.currentMinute,
  });
  assert(
    feasibility.blockingReasons.some((reason) => reason.code === 'CAPACITY_EXCEEDED'),
    `HAB-021 must remain impossible at ${batteryPercent}% battery`,
  );
}

const medicalRoute = planRoute({ world: scenario.world, rover: atlas, order: medical, objective: 'balanced' });
assert(medicalRoute, 'MED-017 must have a connected route for ATLAS-1');
assert(medicalRoute.nodeIds[0] === atlas.nodeId, 'Route must begin at the rover current node');
assert(medicalRoute.nodeIds.includes(medical.originNodeId), 'Route must include the pickup node');
assert(medicalRoute.nodeIds.at(-1) === medical.destinationNodeId, 'Route must end at the destination');

const lowBattery = evaluateDispatchFeasibility({
  order: medical,
  rover: { ...atlas, batteryPercent: 1 },
  route: medicalRoute,
  rules: scenario.rules,
  currentMinute: state.mission.currentMinute,
});
assert(
  lowBattery.blockingReasons.some((reason) => reason.code === 'BATTERY_INSUFFICIENT'),
  'Low battery must block dispatch',
);

const lighterEnergy = calculateSegmentEnergyKwh({
  distanceKm: 10,
  baseEnergyKwhPerKm: 0.4,
  edgeEnergyFactor: 1,
  zoneEnergyMultiplier: 1,
  loadRatio: 0.2,
});
const heavierEnergy = calculateSegmentEnergyKwh({
  distanceKm: 10,
  baseEnergyKwhPerKm: 0.4,
  edgeEnergyFactor: 1,
  zoneEnergyMultiplier: 1,
  loadRatio: 0.9,
});
assert(heavierEnergy > lighterEnergy, 'Heavier load must consume more energy');

const lighterSpeed = calculateEffectiveSpeedKph({
  baseSpeedKph: 30,
  edgeSpeedFactor: 1,
  zoneSpeedMultiplier: 1,
  loadRatio: 0.2,
});
const heavierSpeed = calculateEffectiveSpeedKph({
  baseSpeedKph: 30,
  edgeSpeedFactor: 1,
  zoneSpeedMultiplier: 1,
  loadRatio: 0.9,
});
assert(heavierSpeed < lighterSpeed, 'Heavier load must reduce effective speed');

const weakResistanceRisk = calculateSegmentIncidentRisk({
  baseRisk: 0.2,
  zoneRiskMultiplier: 1.4,
  loadRatio: 0.8,
  roverRiskResistance: 0.1,
});
const strongResistanceRisk = calculateSegmentIncidentRisk({
  baseRisk: 0.2,
  zoneRiskMultiplier: 1.4,
  loadRatio: 0.8,
  roverRiskResistance: 0.8,
});
assert(strongResistanceRisk < weakResistanceRisk, 'Stronger rover resistance must reduce incident risk');

const resolutionInput = {
  mission: state.mission,
  scenario,
  rover: atlas,
  order: medical,
  route: medicalRoute,
  deliveryId: 'delivery_validation',
  idempotencyKey: 'validation-idempotency-key',
  startedAt: '2026-08-14T00:00:00.000Z',
  eventSequenceStart: 0,
  expectedNetCredits: 0,
  seed: 424242,
} as const;
const firstResolution = resolveDelivery(resolutionInput);
const secondResolution = resolveDelivery(resolutionInput);
assert(
  JSON.stringify(firstResolution) === JSON.stringify(secondResolution),
  'Delivery resolution must be reproducible for the same seed and inputs',
);
assert(firstResolution.roverAfter.batteryPercent < atlas.batteryPercent, 'Delivery must consume rover battery');
assert(firstResolution.events.length >= 3, 'Delivery must persist a useful event replay');
assert(firstResolution.economyEntries.length >= 2, 'Delivery must persist energy and outcome ledger entries');

console.log(JSON.stringify({
  scenario: scenario.name,
  validation: 'PASS',
  feasiblePairs: validation.feasiblePairCount,
  impossibleOrders: validation.impossibleOrderCodes,
  plannerCandidates: candidates.length,
  dispatchableCandidates: ready.length,
  recommended: ready[0] ? { order: ready[0].order.code, rover: ready[0].rover.code } : null,
  invariants: {
    capacityIndependentOfBattery: 'PASS',
    lowBatteryBlocksDispatch: 'PASS',
    loadIncreasesEnergy: 'PASS',
    loadReducesSpeed: 'PASS',
    resistanceReducesRisk: 'PASS',
    seededDeliveryReplay: 'PASS',
    stateAndLedgerChange: 'PASS',
  },
}, null, 2));
