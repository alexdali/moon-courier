import type { EconomyEntryId } from '@/domain/common/ids';
import { roundTo } from '@/domain/common/math';
import type { EconomyEntry } from '@/domain/entities/economy';
import type { MissionEvent } from '@/domain/entities/event';
import type { Mission } from '@/domain/entities/mission';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioDefinition } from '@/domain/entities/scenario';
import { calculateRoverChargePlan } from '@/domain/rules/charging';
import { createMissionEvent } from '@/domain/simulation/event-factory';

export interface RoverChargeResolution {
  missionAfter: Mission;
  roverAfter: Rover;
  event: MissionEvent;
  economyEntry: EconomyEntry;
  plan: ReturnType<typeof calculateRoverChargePlan>;
}

export function resolveRoverCharge(input: {
  mission: Mission;
  scenario: ScenarioDefinition;
  rover: Rover;
  sequence: number;
  occurredAt: string;
  targetBatteryPercent?: number;
}): RoverChargeResolution {
  const node = input.scenario.world.nodes.find((item) => item.id === input.rover.nodeId);
  if (!node) throw new Error(`Rover node ${input.rover.nodeId} does not exist`);
  if (!['available', 'charging'].includes(input.rover.status)) {
    throw new Error(`Rover ${input.rover.code} cannot charge while ${input.rover.status}`);
  }
  const plan = calculateRoverChargePlan({
    rover: input.rover,
    rules: input.scenario.rules,
    chargerAvailable: node.hasCharger,
    ...(input.targetBatteryPercent === undefined ? {} : { targetBatteryPercent: input.targetBatteryPercent }),
  });
  if (plan.addedBatteryPercent <= 0) throw new Error(`Rover ${input.rover.code} is already charged`);
  const credits = roundTo(input.mission.credits - plan.costCredits, 2);
  const currentMinute = roundTo(input.mission.currentMinute + plan.durationMinutes, 2);
  const missionAfter: Mission = {
    ...input.mission,
    status: 'active',
    credits,
    currentMinute,
    currentDay: Math.floor(currentMinute / 1_440) + 1,
    updatedAt: input.occurredAt,
  };
  const roverAfter: Rover = {
    ...input.rover,
    status: 'available',
    batteryPercent: plan.targetBatteryPercent,
  };
  const event = createMissionEvent({
    missionId: input.mission.id,
    deliveryId: null,
    sequence: input.sequence,
    type: 'ROVER_CHARGED',
    severity: 'success',
    title: node.hasCharger ? 'Rover charged' : 'Field solar charge completed',
    message: `${input.rover.code} charged from ${plan.currentBatteryPercent.toFixed(0)}% to ${plan.targetBatteryPercent.toFixed(0)}%`,
    payload: { roverId: input.rover.id, nodeId: node.id, plan },
    occurredAt: input.occurredAt,
    simulationOffsetMs: 0,
  });
  const economyEntry: EconomyEntry = {
    id: `eco_charge_${input.mission.id}_${input.sequence}` as EconomyEntryId,
    missionId: input.mission.id,
    deliveryId: null,
    eventId: event.id,
    type: 'charging',
    amountCredits: -plan.costCredits,
    balanceAfter: credits,
    description: node.hasCharger ? `Charging ${input.rover.code} at ${node.name}` : `Field solar charging ${input.rover.code}`,
    createdAt: input.occurredAt,
  };
  return { missionAfter, roverAfter, event, economyEntry, plan };
}
