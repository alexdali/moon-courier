import type { DeliveryId, EconomyEntryId, EventId, MissionId } from '@/domain/common/ids';

export type EconomyEntryType = 'initial' | 'reward' | 'energy' | 'charging' | 'penalty' | 'repair' | 'bonus';

export interface EconomyEntry {
  id: EconomyEntryId;
  missionId: MissionId;
  deliveryId: DeliveryId | null;
  eventId: EventId | null;
  type: EconomyEntryType;
  amountCredits: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}
