import type { DeliveryId, EdgeId, MissionId, NodeId, OrderId, RoverId } from '@/domain/common/ids';

export type DeliveryStatus = 'planned' | 'in_transit' | 'succeeded' | 'failed' | 'cancelled';
export type RouteObjective = 'fastest' | 'safest' | 'efficient' | 'balanced';
export type DeliveryFailureCode =
  | 'CAPACITY_EXCEEDED'
  | 'BATTERY_INSUFFICIENT'
  | 'ROVER_UNAVAILABLE'
  | 'ORDER_UNAVAILABLE'
  | 'NO_ROUTE'
  | 'CARGO_DAMAGED'
  | 'BATTERY_DEPLETED'
  | 'DEADLINE_MISSED';

export interface RouteSegmentMetrics {
  edgeId: EdgeId;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  distanceKm: number;
  durationMinutes: number;
  energyKwh: number;
  incidentRisk: number;
  failureRisk: number;
}

export interface PlannedRoute {
  objective: RouteObjective;
  nodeIds: readonly NodeId[];
  segments: readonly RouteSegmentMetrics[];
  distanceKm: number;
  durationMinutes: number;
  energyKwh: number;
  incidentRisk: number;
  failureRisk: number;
}

export interface Delivery {
  id: DeliveryId;
  missionId: MissionId;
  orderId: OrderId;
  roverId: RoverId;
  status: DeliveryStatus;
  route: PlannedRoute;
  expectedNetCredits: number;
  actualNetCredits: number | null;
  seed: number;
  idempotencyKey: string;
  failureCode: DeliveryFailureCode | null;
  startedAt: string;
  completedAt: string | null;
}
