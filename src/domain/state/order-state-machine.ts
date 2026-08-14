import type { OrderStatus } from '@/domain/entities/order';
import { ValidationError } from '@/domain/common/errors';

const allowed: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['assigned', 'blocked', 'expired'],
  assigned: ['in_transit', 'pending', 'failed'],
  in_transit: ['delivered', 'failed'],
  delivered: [],
  failed: [],
  expired: [],
  blocked: ['pending'],
};

export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!allowed[from].includes(to)) {
    throw new ValidationError(`Invalid order transition ${from} -> ${to}`);
  }
}
