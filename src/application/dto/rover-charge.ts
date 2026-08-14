import type { EconomyEntry } from '@/domain/entities/economy';
import type { MissionEvent } from '@/domain/entities/event';
import type { Mission } from '@/domain/entities/mission';
import type { Rover } from '@/domain/entities/rover';
import type { RoverChargePlan } from '@/domain/rules/charging';

export interface RoverChargeDto {
  mission: Mission;
  rover: Rover;
  event: MissionEvent;
  economyEntry: EconomyEntry;
  plan: RoverChargePlan;
}
