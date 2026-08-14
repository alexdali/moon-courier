import type { Delivery } from '@/domain/entities/delivery';
import type { Rover } from '@/domain/entities/rover';
import type { RoverUtilizationItem } from '@/domain/entities/analytics';
import { clamp, roundTo } from '@/domain/common/math';

export function calculateRoverUtilization(input: {
  rovers: readonly Rover[];
  deliveries: readonly Delivery[];
  missionElapsedMinutes: number;
}): readonly RoverUtilizationItem[] {
  const horizon = Math.max(input.missionElapsedMinutes, 1);
  return input.rovers.map((rover) => {
    const roverDeliveries = input.deliveries.filter((delivery) => delivery.roverId === rover.id);
    const movingMinutes = roverDeliveries.reduce((sum, delivery) => sum + delivery.route.durationMinutes, 0);
    const failedMinutes = roverDeliveries
      .filter((delivery) => delivery.status === 'failed')
      .reduce((sum, delivery) => sum + Math.min(60, delivery.route.durationMinutes * 0.25), 0);
    const chargingMinutes = rover.status === 'charging' ? Math.min(horizon, 45) : 0;
    const movingPercent = clamp(movingMinutes / horizon, 0, 1);
    const chargingPercent = clamp(chargingMinutes / horizon, 0, 1 - movingPercent);
    const damagedPercent = clamp(failedMinutes / horizon, 0, 1 - movingPercent - chargingPercent);
    const idlePercent = clamp(1 - movingPercent - chargingPercent - damagedPercent, 0, 1);
    return {
      roverId: rover.id,
      roverCode: rover.code,
      movingPercent: roundTo(movingPercent, 4),
      chargingPercent: roundTo(chargingPercent, 4),
      idlePercent: roundTo(idlePercent, 4),
      damagedPercent: roundTo(damagedPercent, 4),
    };
  });
}
