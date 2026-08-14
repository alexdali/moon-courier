import type { OrderUrgency } from '@/domain/entities/order';
import type { RouteObjective } from '@/domain/entities/delivery';

export interface DispatchConstraints {
  prioritizeUrgencies: readonly OrderUrgency[];
  minimumBatteryReservePercent: number;
  maximumIncidentRisk: number | null;
  excludedRoverCodes: readonly string[];
  preferredObjective: RouteObjective;
  prioritizeProfit: boolean;
}

export const defaultDispatchConstraints: DispatchConstraints = {
  prioritizeUrgencies: ['critical', 'high', 'normal', 'low'],
  minimumBatteryReservePercent: 15,
  maximumIncidentRisk: null,
  excludedRoverCodes: [],
  preferredObjective: 'balanced',
  prioritizeProfit: false,
};
