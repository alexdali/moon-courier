import type { Delivery } from '@/domain/entities/delivery';
import type { EconomyEntry } from '@/domain/entities/economy';
import type { MissionEvent } from '@/domain/entities/event';
import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { SegmentResolution } from '@/domain/simulation/delivery-resolver';

export interface DeliveryReplayDto {
  delivery: Delivery;
  mission: Mission;
  rover: Rover;
  order: DeliveryOrder;
  events: readonly MissionEvent[];
  economyEntries: readonly EconomyEntry[];
  segments: readonly SegmentResolution[];
}
