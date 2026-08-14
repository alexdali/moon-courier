import type { EconomyEntry } from '@/domain/entities/economy';
import type { MissionEvent } from '@/domain/entities/event';
import type { Mission } from '@/domain/entities/mission';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioRules } from '@/domain/entities/scenario';
import { roundTo } from '@/domain/common/math';
import { calculateRoverRepairPlan } from '@/domain/rules/maintenance';
import { createMissionEvent } from '@/domain/simulation/event-factory';

export function resolveRoverRepair(input: {
  mission: Mission;
  rover: Rover;
  rules: ScenarioRules;
  sequence: number;
  occurredAt: string;
}): {
  missionAfter: Mission;
  roverAfter: Rover;
  event: MissionEvent;
  economyEntry: EconomyEntry;
  plan: ReturnType<typeof calculateRoverRepairPlan>;
} {
  const plan = calculateRoverRepairPlan(input.rover, input.rules);
  const currentMinute = roundTo(input.mission.currentMinute + plan.durationMinutes, 2);
  const credits = roundTo(input.mission.credits - plan.costCredits, 2);
  const missionAfter: Mission = {
    ...input.mission,
    status: 'active',
    currentMinute,
    currentDay: Math.floor(currentMinute / 1_440) + 1,
    credits,
    updatedAt: input.occurredAt,
  };
  const roverAfter: Rover = { ...input.rover, status: plan.restoredStatus };
  const event = createMissionEvent({
    missionId: input.mission.id,
    deliveryId: null,
    sequence: input.sequence,
    type: 'ROVER_REPAIRED',
    severity: 'success',
    title: 'Rover repaired',
    message: `${input.rover.code} returned to service after ${plan.durationMinutes} minutes`,
    payload: { roverId: input.rover.id, plan },
    occurredAt: input.occurredAt,
    simulationOffsetMs: 0,
  });
  const economyEntry: EconomyEntry = {
    id: `eco_repair_${input.mission.id}_${input.sequence}`,
    missionId: input.mission.id,
    deliveryId: null,
    eventId: event.id,
    type: 'repair',
    amountCredits: -plan.costCredits,
    balanceAfter: credits,
    description: `Repair ${input.rover.code}`,
    createdAt: input.occurredAt,
  };
  return { missionAfter, roverAfter, event, economyEntry, plan };
}
