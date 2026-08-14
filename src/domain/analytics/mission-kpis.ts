import type { Delivery } from '@/domain/entities/delivery';
import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { RoverUtilizationItem, MissionKpis } from '@/domain/entities/analytics';
import { roundTo } from '@/domain/common/math';

export function calculateMissionKpis(input: {
  mission: Mission;
  orders: readonly DeliveryOrder[];
  deliveries: readonly Delivery[];
  roverUtilization: readonly RoverUtilizationItem[];
  startingCredits: number;
}): MissionKpis {
  const deliveredOrders = input.orders.filter((order) => order.status === 'delivered').length;
  const failedDeliveries = input.deliveries.filter((delivery) => delivery.status === 'failed').length;
  const blockedOrders = input.orders.filter((order) => order.status === 'blocked' || order.impossibleReason).length;
  const actionableOrders = input.orders.filter((order) => order.status !== 'blocked' && !order.impossibleReason).length;
  const completionRate = actionableOrders === 0 ? 0 : deliveredOrders / actionableOrders;
  const averageRoverUtilization = input.roverUtilization.length === 0
    ? 0
    : input.roverUtilization.reduce((sum, rover) => sum + rover.movingPercent, 0) / input.roverUtilization.length;
  return {
    credits: input.mission.credits,
    netChange: roundTo(input.mission.credits - input.startingCredits, 2),
    completionRate: roundTo(completionRate, 4),
    totalDeliveries: input.deliveries.length,
    deliveredOrders,
    failedDeliveries,
    blockedOrders,
    averageRoverUtilization: roundTo(averageRoverUtilization, 4),
  };
}
