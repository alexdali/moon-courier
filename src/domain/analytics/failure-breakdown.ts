import type { Delivery } from '@/domain/entities/delivery';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { FailureBreakdownItem } from '@/domain/entities/analytics';

const labels: Record<string, string> = {
  CAPACITY_EXCEEDED: 'Capacity exceeded',
  BATTERY_INSUFFICIENT: 'Battery insufficient',
  ROVER_UNAVAILABLE: 'Rover unavailable',
  ORDER_UNAVAILABLE: 'Order unavailable',
  NO_ROUTE: 'No route',
  CARGO_DAMAGED: 'Cargo damaged',
  BATTERY_DEPLETED: 'Battery depleted',
  DEADLINE_MISSED: 'Deadline missed',
  BLOCKED_ORDER: 'Intentionally impossible order',
  UNKNOWN: 'Unknown failure',
};

export function buildFailureBreakdown(input: {
  deliveries: readonly Delivery[];
  orders: readonly DeliveryOrder[];
}): readonly FailureBreakdownItem[] {
  const counts = new Map<string, number>();
  for (const delivery of input.deliveries) {
    if (delivery.status !== 'failed') continue;
    const reason = delivery.failureCode ?? 'UNKNOWN';
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  for (const order of input.orders) {
    if (!order.impossibleReason) continue;
    counts.set('BLOCKED_ORDER', (counts.get('BLOCKED_ORDER') ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason: labels[reason] ?? reason, count }))
    .sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason));
}
