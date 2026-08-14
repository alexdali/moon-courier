import type { RoverId } from '@/domain/common/ids';

export interface MissionKpis {
  credits: number;
  netChange: number;
  completionRate: number;
  totalDeliveries: number;
  deliveredOrders: number;
  failedDeliveries: number;
  blockedOrders: number;
  averageRoverUtilization: number;
}

export interface FailureBreakdownItem {
  reason: string;
  count: number;
}

export interface RoverUtilizationItem {
  roverId: RoverId;
  roverCode: string;
  movingPercent: number;
  chargingPercent: number;
  idlePercent: number;
  damagedPercent: number;
}

export interface EconomyPoint {
  sequence: number;
  label: string;
  balance: number;
  delta: number;
}

export interface AnalyticsEvidence {
  eventCount: number;
  deliveryCount: number;
  simulationIterations: number;
  generatedAt: string;
}
