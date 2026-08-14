import type { MissionGoalStatus } from '@/domain/rules/mission-goal';
import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { MissionEvent } from '@/domain/entities/event';
import type { WorldMap } from '@/domain/entities/world';

export interface MissionDashboardDto {
  mission: Mission;
  scenario: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    durationDays: number;
    minimumBatteryReservePercent: number;
  };
  world: WorldMap;
  rovers: readonly Rover[];
  orders: readonly DeliveryOrder[];
  events: readonly MissionEvent[];
  goal: MissionGoalStatus;
  ai: {
    enabled: boolean;
    primaryModel: string;
    fallbackModel: string;
    mode: 'online' | 'offline';
  };
}
