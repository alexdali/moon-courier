import type { DispatchFeasibility } from '@/domain/rules/feasibility';
import type { EconomyEstimate } from '@/domain/rules/economy';
import type { PlannedRoute } from '@/domain/entities/delivery';

export interface DispatchPreviewDto {
  missionId: string;
  orderId: string;
  roverId: string;
  orderCode: string;
  roverCode: string;
  route: PlannedRoute | null;
  feasibility: DispatchFeasibility;
  economy: EconomyEstimate | null;
  successProbability: number;
}
