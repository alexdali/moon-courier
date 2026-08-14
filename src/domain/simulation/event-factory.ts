import type { DeliveryId, EventId, MissionId } from '@/domain/common/ids';
import type { EventSeverity, MissionEvent, MissionEventType } from '@/domain/entities/event';

export interface EventFactoryInput {
  missionId: MissionId;
  deliveryId?: DeliveryId | null;
  sequence: number;
  type: MissionEventType;
  severity: EventSeverity;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
  occurredAt: string;
  simulationOffsetMs?: number;
}

export function createMissionEvent(input: EventFactoryInput): MissionEvent {
  const id: EventId = `evt_${input.missionId}_${input.sequence}`;
  return {
    id,
    missionId: input.missionId,
    deliveryId: input.deliveryId ?? null,
    sequence: input.sequence,
    type: input.type,
    severity: input.severity,
    title: input.title,
    message: input.message,
    payload: input.payload ?? {},
    occurredAt: input.occurredAt,
    simulationOffsetMs: input.simulationOffsetMs ?? input.sequence * 700,
  };
}
