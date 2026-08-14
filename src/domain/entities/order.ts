import type { MissionId, NodeId, OrderId } from '@/domain/common/ids';

export type OrderUrgency = 'low' | 'normal' | 'high' | 'critical';
export type OrderStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'expired' | 'blocked';

export interface OrderTemplate {
  code: string;
  title: string;
  category: string;
  originNodeId: NodeId;
  destinationNodeId: NodeId;
  weightKg: number;
  rewardCredits: number;
  failurePenaltyCredits: number;
  urgency: OrderUrgency;
  deadlineMinute: number | null;
}

export interface DeliveryOrder extends OrderTemplate {
  id: OrderId;
  missionId: MissionId;
  status: OrderStatus;
  impossibleReason: string | null;
  createdAt: string;
  updatedAt: string;
}
