import type { PlannedRoute } from '@/domain/entities/delivery';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { EconomyEstimate } from '@/domain/rules/economy';
import type { DispatchFeasibility } from '@/domain/rules/feasibility';

export interface DispatchCandidate {
  order: DeliveryOrder;
  rover: Rover;
  route: PlannedRoute | null;
  feasibility: DispatchFeasibility;
  economy: EconomyEstimate | null;
  score: number;
  rankReasons: readonly string[];
}
