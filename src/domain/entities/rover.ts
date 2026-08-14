import type { MissionId, NodeId, RoverId } from '@/domain/common/ids';

export type RoverStatus = 'available' | 'assigned' | 'en_route' | 'charging' | 'damaged' | 'disabled';

export interface RoverTemplate {
  code: string;
  name: string;
  capacityKg: number;
  batteryCapacityKwh: number;
  startingBatteryPercent: number;
  baseSpeedKph: number;
  baseEnergyKwhPerKm: number;
  riskResistance: number;
  repairCostCredits: number;
  startingNodeId: NodeId;
  startingStatus?: RoverStatus;
}

export interface Rover {
  id: RoverId;
  missionId: MissionId;
  code: string;
  name: string;
  status: RoverStatus;
  nodeId: NodeId;
  batteryPercent: number;
  batteryCapacityKwh: number;
  capacityKg: number;
  baseSpeedKph: number;
  baseEnergyKwhPerKm: number;
  riskResistance: number;
  repairCostCredits: number;
  metadata: Record<string, unknown>;
}
