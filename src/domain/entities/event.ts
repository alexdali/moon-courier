import type { DeliveryId, EventId, MissionId } from '@/domain/common/ids';

export type MissionEventType =
  | 'MISSION_STARTED'
  | 'ORDER_SELECTED'
  | 'DISPATCH_PREVIEWED'
  | 'DELIVERY_STARTED'
  | 'ROVER_MOVED'
  | 'ZONE_ENTERED'
  | 'RISK_DELAY'
  | 'BATTERY_DRAINED'
  | 'ROVER_CHARGED'
  | 'ROVER_REPAIRED'
  | 'CARGO_DAMAGED'
  | 'DELIVERY_SUCCEEDED'
  | 'DELIVERY_FAILED'
  | 'ECONOMY_CHANGED'
  | 'AI_RECOMMENDATION'
  | 'SCENARIO_GENERATED'
  | 'SCENARIO_REJECTED';

export type EventSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface MissionEvent {
  id: EventId;
  missionId: MissionId;
  deliveryId: DeliveryId | null;
  sequence: number;
  type: MissionEventType;
  severity: EventSeverity;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  simulationOffsetMs: number;
}
