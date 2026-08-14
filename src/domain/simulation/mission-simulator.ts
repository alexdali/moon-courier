import type { ScenarioDefinition } from '@/domain/entities/scenario';
import type { SimulationPolicy, SimulationSample, SimulationSummary } from '@/domain/entities/simulation';
import { mean, roundTo } from '@/domain/common/math';
import { combineSeed } from '@/domain/common/seeded-random';
import { buildDispatchCandidates } from '@/domain/planning/dispatch-planner';
import { policyToConstraints } from '@/domain/planning/policies';
import { resolveDelivery } from '@/domain/simulation/delivery-resolver';
import { createInMemoryMission } from '@/domain/simulation/mission-factory';
import { resolveRoverCharge } from '@/domain/simulation/rover-charger';
import { resolveRoverRepair } from '@/domain/simulation/rover-repairer';
import { percentile } from '@/domain/analytics/percentiles';

export function simulateScenarioOnce(input: {
  scenario: ScenarioDefinition;
  policy: SimulationPolicy;
  seed: number;
}): SimulationSample {
  const state = createInMemoryMission(input.scenario, String(input.seed));
  let failedDeliveries = 0;
  let deliveredOrders = 0;
  let sequence = 0;
  const maximumSteps = state.orders.length * 4 + state.rovers.length * 3 + 8;
  for (let step = 0; step < maximumSteps; step += 1) {
    const candidates = buildDispatchCandidates({
      mission: state.mission,
      scenario: input.scenario,
      orders: state.orders,
      rovers: state.rovers,
      constraints: policyToConstraints(input.policy),
    });
    const candidate = candidates.find((item) => Number.isFinite(item.score));
    if (!candidate || !candidate.route) {
      const roverToRepair = state.rovers.find((rover) => rover.status === 'damaged');
      if (roverToRepair) {
        const repair = resolveRoverRepair({
          mission: state.mission,
          rover: roverToRepair,
          rules: input.scenario.rules,
          sequence: sequence + 1,
          occurredAt: '2026-01-01T00:00:00.000Z',
        });
        sequence += 1;
        state.mission = repair.missionAfter;
        state.rovers = state.rovers.map((rover) => rover.id === repair.roverAfter.id ? repair.roverAfter : rover);
        if (state.mission.credits < 0 || state.mission.currentDay > input.scenario.rules.durationDays) break;
        continue;
      }
      const roverToCharge = state.rovers
        .filter((rover) => rover.status === 'available' && rover.batteryPercent < 99.5)
        .sort((left, right) => left.batteryPercent - right.batteryPercent)[0];
      if (!roverToCharge) break;
      const charge = resolveRoverCharge({
        mission: state.mission,
        scenario: input.scenario,
        rover: roverToCharge,
        sequence: sequence + 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        targetBatteryPercent: 100,
      });
      sequence += 1;
      state.mission = charge.missionAfter;
      state.rovers = state.rovers.map((rover) => rover.id === charge.roverAfter.id ? charge.roverAfter : rover);
      if (state.mission.credits < 0 || state.mission.currentDay > input.scenario.rules.durationDays) break;
      continue;
    }
    const deliveryId = `sim_delivery_${step + 1}`;
    const resolution = resolveDelivery({
      mission: state.mission,
      scenario: input.scenario,
      rover: candidate.rover,
      order: candidate.order,
      route: candidate.route,
      deliveryId,
      idempotencyKey: deliveryId,
      startedAt: '2026-01-01T00:00:00.000Z',
      eventSequenceStart: sequence,
      expectedNetCredits: candidate.economy?.expectedNetCredits ?? 0,
      seed: combineSeed(input.seed, step, candidate.order.code, candidate.rover.code),
    });
    sequence += resolution.events.length;
    state.mission = resolution.missionAfter;
    state.rovers = state.rovers.map((rover) => (rover.id === resolution.roverAfter.id ? resolution.roverAfter : rover));
    state.orders = state.orders.map((order) => (order.id === resolution.orderAfter.id ? resolution.orderAfter : order));
    if (resolution.delivery.status === 'succeeded') deliveredOrders += 1;
    else failedDeliveries += 1;
    if (state.mission.credits < 0 || state.mission.currentDay > input.scenario.rules.durationDays) break;
  }
  const pendingOrders = state.orders.filter((order) => order.status === 'pending').length;
  return {
    seed: input.seed,
    finalCredits: state.mission.credits,
    deliveredOrders,
    failedDeliveries,
    expiredOrders: pendingOrders,
    success: state.mission.credits >= input.scenario.rules.targetCredits,
  };
}

export function runMonteCarlo(input: {
  scenario: ScenarioDefinition;
  policy: SimulationPolicy;
  iterations: number;
  seed: number;
}): { samples: readonly SimulationSample[]; summary: SimulationSummary } {
  const samples = Array.from({ length: input.iterations }, (_, index) =>
    simulateScenarioOnce({
      scenario: input.scenario,
      policy: input.policy,
      seed: combineSeed(input.seed, index),
    }),
  );
  const credits = samples.map((sample) => sample.finalCredits);
  const totalOrders = Math.max(1, input.scenario.orderTemplates.length);
  return {
    samples,
    summary: {
      iterations: samples.length,
      successRate: roundTo(samples.filter((sample) => sample.success).length / Math.max(1, samples.length), 4),
      bankruptcyRate: roundTo(samples.filter((sample) => sample.finalCredits < 0).length / Math.max(1, samples.length), 4),
      meanFinalCredits: roundTo(mean(credits), 2),
      medianFinalCredits: roundTo(percentile(credits, 0.5), 2),
      p10FinalCredits: roundTo(percentile(credits, 0.1), 2),
      p90FinalCredits: roundTo(percentile(credits, 0.9), 2),
      meanCompletionRate: roundTo(mean(samples.map((sample) => sample.deliveredOrders / totalOrders)), 4),
      meanFailedDeliveries: roundTo(mean(samples.map((sample) => sample.failedDeliveries)), 2),
    },
  };
}
