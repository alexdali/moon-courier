import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { ScenarioDefinition } from '@/domain/entities/scenario';

export function createPersistentMissionState(input: {
  scenario: ScenarioDefinition;
  missionId: string;
  now: string;
}): { mission: Mission; rovers: readonly Rover[]; orders: readonly DeliveryOrder[] } {
  const { scenario, missionId, now } = input;
  const maximumCapacity = Math.max(...scenario.roverTemplates.map((rover) => rover.capacityKg), 0);
  return {
    mission: {
      id: missionId,
      scenarioId: scenario.id,
      name: scenario.name,
      status: 'active',
      currentMinute: 0,
      currentDay: 1,
      credits: scenario.rules.startingCredits,
      score: 0,
      rating: 100,
      targetCredits: scenario.rules.targetCredits,
      seed: scenario.seed,
      startedAt: now,
      endedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    rovers: scenario.roverTemplates.map((template, index) => ({
      id: `${missionId}_rover_${index + 1}`,
      missionId,
      code: template.code,
      name: template.name,
      status: template.startingStatus ?? 'available',
      nodeId: template.startingNodeId,
      batteryPercent: template.startingBatteryPercent,
      batteryCapacityKwh: template.batteryCapacityKwh,
      capacityKg: template.capacityKg,
      baseSpeedKph: template.baseSpeedKph,
      baseEnergyKwhPerKm: template.baseEnergyKwhPerKm,
      riskResistance: template.riskResistance,
      repairCostCredits: template.repairCostCredits,
      metadata: {},
    })),
    orders: scenario.orderTemplates.map((template, index) => {
      const impossibleReason = template.weightKg > maximumCapacity
        ? `Payload ${template.weightKg} kg exceeds fleet maximum capacity ${maximumCapacity} kg`
        : null;
      return {
        ...template,
        id: `${missionId}_order_${index + 1}`,
        missionId,
        status: 'pending',
        impossibleReason,
        createdAt: now,
        updatedAt: now,
      };
    }),
  };
}
