import type { DeliveryId, EconomyEntryId } from '@/domain/common/ids';
import { combineSeed, SeededRandom } from '@/domain/common/seeded-random';
import { clamp, roundTo } from '@/domain/common/math';
import type { Delivery, DeliveryFailureCode, PlannedRoute } from '@/domain/entities/delivery';
import type { EconomyEntry } from '@/domain/entities/economy';
import type { MissionEvent } from '@/domain/entities/event';
import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioDefinition } from '@/domain/entities/scenario';
import { energyKwhToBatteryPercent } from '@/domain/rules/energy';
import { createMissionEvent } from '@/domain/simulation/event-factory';
import { addMinutesIso } from '@/lib/time';

export interface SegmentResolution {
  sequence: number;
  edgeId: string;
  outcome: 'clear' | 'delay' | 'battery_loss' | 'failure';
  durationMinutes: number;
  energyKwh: number;
  incidentRoll: number;
  severityRoll: number | null;
}

export interface DeliveryResolution {
  delivery: Delivery;
  missionAfter: Mission;
  roverAfter: Rover;
  orderAfter: DeliveryOrder;
  events: readonly MissionEvent[];
  economyEntries: readonly EconomyEntry[];
  segments: readonly SegmentResolution[];
}

export function resolveDelivery(input: {
  mission: Mission;
  scenario: ScenarioDefinition;
  rover: Rover;
  order: DeliveryOrder;
  route: PlannedRoute;
  deliveryId: DeliveryId;
  idempotencyKey: string;
  startedAt: string;
  eventSequenceStart: number;
  expectedNetCredits: number;
  seed?: number;
}): DeliveryResolution {
  const seed = input.seed ?? combineSeed(input.mission.seed, input.deliveryId, input.order.id, input.rover.id);
  const random = new SeededRandom(seed);
  const events: MissionEvent[] = [];
  const economyEntries: EconomyEntry[] = [];
  const segments: SegmentResolution[] = [];
  let sequence = input.eventSequenceStart;
  let batteryPercent = input.rover.batteryPercent;
  let durationMinutes = 0;
  let failed = false;
  let failureCode: DeliveryFailureCode | null = null;
  let currentNodeId = input.rover.nodeId;

  const pushEvent = (
    event: Omit<Parameters<typeof createMissionEvent>[0], 'missionId' | 'deliveryId' | 'sequence' | 'occurredAt'>,
    minuteOffset = durationMinutes,
  ) => {
    sequence += 1;
    events.push(
      createMissionEvent({
        ...event,
        missionId: input.mission.id,
        deliveryId: input.deliveryId,
        sequence,
        occurredAt: addMinutesIso(input.startedAt, minuteOffset),
      }),
    );
  };

  pushEvent({
    type: 'DELIVERY_STARTED',
    severity: 'info',
    title: 'Delivery started',
    message: `${input.rover.code} departed with ${input.order.code}`,
    payload: { roverId: input.rover.id, orderId: input.order.id, route: input.route.nodeIds },
    simulationOffsetMs: 0,
  });

  for (const [index, segment] of input.route.segments.entries()) {
    if (failed) break;
    const incidentRoll = random.next();
    const segmentBattery = energyKwhToBatteryPercent(segment.energyKwh, input.rover.batteryCapacityKwh);
    batteryPercent = roundTo(batteryPercent - segmentBattery, 2);
    durationMinutes += segment.durationMinutes;
    currentNodeId = segment.toNodeId;
    let outcome: SegmentResolution['outcome'] = 'clear';
    let severityRoll: number | null = null;

    pushEvent({
      type: 'ROVER_MOVED',
      severity: 'info',
      title: 'Route segment completed',
      message: `${input.rover.code} reached ${segment.toNodeId}`,
      payload: { edgeId: segment.edgeId, batteryPercent },
      simulationOffsetMs: 650 + index * 850,
    });

    if (batteryPercent < 0) {
      failed = true;
      failureCode = 'BATTERY_DEPLETED';
      outcome = 'failure';
    } else if (incidentRoll < segment.incidentRisk) {
      severityRoll = random.next();
      if (severityRoll < 0.55) {
        outcome = 'delay';
        durationMinutes += input.scenario.rules.riskDelayMinutes;
        pushEvent({
          type: 'RISK_DELAY',
          severity: 'warning',
          title: 'Terrain delay',
          message: `Dust and terrain added ${input.scenario.rules.riskDelayMinutes} minutes`,
          payload: { edgeId: segment.edgeId },
          simulationOffsetMs: 900 + index * 850,
        });
      } else if (severityRoll < 0.82) {
        outcome = 'battery_loss';
        batteryPercent = roundTo(
          batteryPercent - input.scenario.rules.incidentBatteryLossPercent,
          2,
        );
        pushEvent({
          type: 'BATTERY_DRAINED',
          severity: 'warning',
          title: 'Unexpected battery drain',
          message: `${input.scenario.rules.incidentBatteryLossPercent}% battery lost in difficult terrain`,
          payload: { edgeId: segment.edgeId, batteryPercent },
          simulationOffsetMs: 900 + index * 850,
        });
        if (batteryPercent < 0) {
          failed = true;
          failureCode = 'BATTERY_DEPLETED';
          outcome = 'failure';
        }
      } else {
        outcome = 'failure';
        failed = true;
        failureCode = 'CARGO_DAMAGED';
        pushEvent({
          type: 'CARGO_DAMAGED',
          severity: 'critical',
          title: 'Cargo damaged',
          message: `${input.order.code} was damaged on edge ${segment.edgeId}`,
          payload: { edgeId: segment.edgeId },
          simulationOffsetMs: 900 + index * 850,
        });
      }
    }
    segments.push({
      sequence: index + 1,
      edgeId: segment.edgeId,
      outcome,
      durationMinutes: segment.durationMinutes,
      energyKwh: segment.energyKwh,
      incidentRoll,
      severityRoll,
    });
  }

  const completedAt = addMinutesIso(input.startedAt, durationMinutes);
  const consumedEnergyKwh = roundTo(segments.reduce((total, segment) => total + segment.energyKwh, 0), 4);
  const energyCost = roundTo(consumedEnergyKwh * input.scenario.rules.energyPriceCreditsPerKwh, 2);
  let balance = input.mission.credits;
  const addEconomyEntry = (type: EconomyEntry['type'], amountCredits: number, description: string) => {
    balance = roundTo(balance + amountCredits, 2);
    const id: EconomyEntryId = `eco_${input.deliveryId}_${economyEntries.length + 1}`;
    economyEntries.push({
      id,
      missionId: input.mission.id,
      deliveryId: input.deliveryId,
      eventId: null,
      type,
      amountCredits,
      balanceAfter: balance,
      description,
      createdAt: completedAt,
    });
  };

  addEconomyEntry('energy', -energyCost, 'Energy consumed by delivery');
  const arrivalMinute = input.mission.currentMinute + durationMinutes;
  const lateMinutes = input.order.deadlineMinute === null ? 0 : Math.max(0, arrivalMinute - input.order.deadlineMinute);
  const latePenalty = roundTo(lateMinutes * input.scenario.rules.latePenaltyCreditsPerMinute, 2);
  if (latePenalty > 0) addEconomyEntry('penalty', -latePenalty, 'Late delivery penalty');

  if (failed) {
    addEconomyEntry('penalty', -input.order.failurePenaltyCredits, 'Failed delivery penalty');
    pushEvent({
      type: 'DELIVERY_FAILED',
      severity: 'critical',
      title: 'Delivery failed',
      message: `${input.order.code} failed: ${failureCode ?? 'unknown incident'}`,
      payload: { failureCode, netCredits: balance - input.mission.credits },
      simulationOffsetMs: 1_500 + input.route.segments.length * 850,
    });
  } else {
    addEconomyEntry('reward', input.order.rewardCredits, 'Delivery reward');
    pushEvent({
      type: 'DELIVERY_SUCCEEDED',
      severity: 'success',
      title: 'Delivery completed',
      message: `${input.order.code} delivered by ${input.rover.code}`,
      payload: { rewardCredits: input.order.rewardCredits, netCredits: balance - input.mission.credits },
      simulationOffsetMs: 1_500 + input.route.segments.length * 850,
    });
  }

  pushEvent({
    type: 'ECONOMY_CHANGED',
    severity: balance >= input.mission.credits ? 'success' : 'warning',
    title: 'Mission economy updated',
    message: `Balance is now ${balance} credits`,
    payload: { balance, delta: roundTo(balance - input.mission.credits, 2) },
    simulationOffsetMs: 1_800 + input.route.segments.length * 850,
  });

  const delivery: Delivery = {
    id: input.deliveryId,
    missionId: input.mission.id,
    orderId: input.order.id,
    roverId: input.rover.id,
    status: failed ? 'failed' : 'succeeded',
    route: input.route,
    expectedNetCredits: input.expectedNetCredits,
    actualNetCredits: roundTo(balance - input.mission.credits, 2),
    seed,
    idempotencyKey: input.idempotencyKey,
    failureCode,
    startedAt: input.startedAt,
    completedAt,
  };

  const currentDay = Math.floor(arrivalMinute / 1_440) + 1;
  return {
    delivery,
    missionAfter: {
      ...input.mission,
      status: 'active',
      currentMinute: roundTo(arrivalMinute, 2),
      currentDay,
      credits: balance,
      score: roundTo(input.mission.score + Math.max(0, delivery.actualNetCredits ?? 0), 2),
      rating: clamp(input.mission.rating + (failed ? -3 : 1), 0, 100),
      updatedAt: completedAt,
    },
    roverAfter: {
      ...input.rover,
      status: failed ? 'damaged' : 'available',
      nodeId: currentNodeId,
      batteryPercent: clamp(batteryPercent, 0, 100),
    },
    orderAfter: {
      ...input.order,
      status: failed ? 'failed' : 'delivered',
      updatedAt: completedAt,
    },
    events,
    economyEntries,
    segments,
  };
}
