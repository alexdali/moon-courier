import { roundTo } from '@/domain/common/math';
import type { PlannedRoute, DeliveryFailureCode } from '@/domain/entities/delivery';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioRules } from '@/domain/entities/scenario';
import { energyKwhToBatteryPercent } from '@/domain/rules/energy';
import { calculateCapacityDeficitKg, calculateCapacityUtilizationPercent } from '@/domain/rules/load';

export type FeasibilityStatus = 'ready' | 'warning' | 'impossible';

export interface FeasibilityReason {
  code: DeliveryFailureCode;
  message: string;
  actual?: number;
  required?: number;
  unit?: string;
}

export interface DispatchFeasibility {
  status: FeasibilityStatus;
  blockingReasons: readonly FeasibilityReason[];
  warnings: readonly FeasibilityReason[];
  batteryRequiredPercent: number;
  batteryAfterPercent: number;
  capacityUtilizationPercent: number;
}

export function evaluateDispatchFeasibility(input: {
  order: DeliveryOrder;
  rover: Rover;
  route: PlannedRoute | null;
  rules: ScenarioRules;
  currentMinute: number;
}): DispatchFeasibility {
  const blockingReasons: FeasibilityReason[] = [];
  const warnings: FeasibilityReason[] = [];
  if (input.order.status !== 'pending') {
    blockingReasons.push({
      code: 'ORDER_UNAVAILABLE',
      message: `Order is ${input.order.status}`,
    });
  }
  if (input.rover.status !== 'available') {
    blockingReasons.push({
      code: 'ROVER_UNAVAILABLE',
      message: `Rover is ${input.rover.status}`,
    });
  }
  const capacityDeficit = calculateCapacityDeficitKg(input.order.weightKg, input.rover.capacityKg);
  if (capacityDeficit > 0) {
    blockingReasons.push({
      code: 'CAPACITY_EXCEEDED',
      message: `Payload exceeds capacity by ${capacityDeficit} kg`,
      actual: input.order.weightKg,
      required: input.rover.capacityKg,
      unit: 'kg',
    });
  }
  if (!input.route) {
    blockingReasons.push({ code: 'NO_ROUTE', message: 'No connected route exists' });
  }
  const batteryRequiredPercent = input.route
    ? energyKwhToBatteryPercent(input.route.energyKwh, input.rover.batteryCapacityKwh)
    : Number.POSITIVE_INFINITY;
  const batteryAfterPercent = roundTo(input.rover.batteryPercent - batteryRequiredPercent, 2);
  if (Number.isFinite(batteryRequiredPercent) && batteryAfterPercent < input.rules.minimumBatteryReservePercent) {
    blockingReasons.push({
      code: 'BATTERY_INSUFFICIENT',
      message: `Battery would fall below ${input.rules.minimumBatteryReservePercent}% reserve`,
      actual: batteryAfterPercent,
      required: input.rules.minimumBatteryReservePercent,
      unit: '%',
    });
  }
  if (input.route && input.route.incidentRisk >= 0.25) {
    warnings.push({
      code: 'CARGO_DAMAGED',
      message: `High route incident risk: ${Math.round(input.route.incidentRisk * 100)}%`,
      actual: input.route.incidentRisk,
    });
  }
  if (
    input.route &&
    input.order.deadlineMinute !== null &&
    input.currentMinute + input.route.durationMinutes > input.order.deadlineMinute
  ) {
    warnings.push({
      code: 'DEADLINE_MISSED',
      message: 'Projected arrival is after the deadline',
      actual: input.currentMinute + input.route.durationMinutes,
      required: input.order.deadlineMinute,
      unit: 'mission minute',
    });
  }
  return {
    status: blockingReasons.length > 0 ? 'impossible' : warnings.length > 0 ? 'warning' : 'ready',
    blockingReasons,
    warnings,
    batteryRequiredPercent: roundTo(batteryRequiredPercent, 2),
    batteryAfterPercent,
    capacityUtilizationPercent: calculateCapacityUtilizationPercent(input.order.weightKg, input.rover.capacityKg),
  };
}
