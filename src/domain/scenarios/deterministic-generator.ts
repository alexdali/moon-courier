import type { ScenarioBlueprint } from '@/domain/scenarios/blueprint';

export function createDeterministicScenarioBlueprint(seed = 384719): ScenarioBlueprint {
  return {
    title: 'Shackleton Medical Surge',
    summary: 'A seven-day relief mission with limited heavy transport and a day-four medical demand spike.',
    seed,
    durationDays: 7,
    difficulty: 'hard',
    startingCredits: 2_400,
    targetCredits: 3_200,
    demandNarrative: 'Medical and life-support demand rises sharply while shadow sectors remain risky.',
    victoryNarrative: 'Reach 3,200 credits without allowing the base rating to collapse.',
    sites: [
      { code: 'BASE', name: 'Artemis Base', kind: 'base', x: 14, y: 66, environment: 'plain', hasCharger: true },
      { code: 'SHAK', name: 'Shackleton Hub', kind: 'colony', x: 76, y: 22, environment: 'shadow', hasCharger: false },
      { code: 'TYCH', name: 'Tycho Works', kind: 'colony', x: 46, y: 43, environment: 'crater', hasCharger: false },
      { code: 'AUR', name: 'Aurora Lab', kind: 'colony', x: 83, y: 65, environment: 'dust', hasCharger: false },
      { code: 'EAST', name: 'East Charger', kind: 'charger', x: 66, y: 49, environment: 'plain', hasCharger: true },
      { code: 'RIDGE', name: 'Ridge Relay', kind: 'relay', x: 30, y: 25, environment: 'ridge', hasCharger: false },
    ],
    rovers: [
      { code: 'ATLAS-1', name: 'Atlas Heavy Rover', capacityKg: 120, batteryCapacityKwh: 60, startingBatteryPercent: 84, baseSpeedKph: 28, riskResistance: 0.42 },
      { code: 'SCOUT-2', name: 'Scout Fast Rover', capacityKg: 45, batteryCapacityKwh: 32, startingBatteryPercent: 63, baseSpeedKph: 42, riskResistance: 0.22 },
      { code: 'MULE-3', name: 'Mule Utility Rover', capacityKg: 90, batteryCapacityKwh: 55, startingBatteryPercent: 21, baseSpeedKph: 23, riskResistance: 0.35 },
    ],
    orders: [
      { code: 'MED-017', title: 'Medical oxygen', category: 'medical', destinationSiteCode: 'SHAK', weightKg: 72, rewardCredits: 480, failurePenaltyCredits: 120, urgency: 'critical', deadlineMinute: 160 },
      { code: 'COM-008', title: 'Communication module', category: 'equipment', destinationSiteCode: 'AUR', weightKg: 34, rewardCredits: 260, failurePenaltyCredits: 80, urgency: 'high', deadlineMinute: 260 },
      { code: 'BIO-014', title: 'Biological samples', category: 'science', destinationSiteCode: 'RIDGE', weightKg: 18, rewardCredits: 210, failurePenaltyCredits: 70, urgency: 'critical', deadlineMinute: 95 },
      { code: 'WTR-011', title: 'Water recycling filters', category: 'life-support', destinationSiteCode: 'TYCH', weightKg: 88, rewardCredits: 430, failurePenaltyCredits: 110, urgency: 'high', deadlineMinute: 360 },
      { code: 'SOL-006', title: 'Solar inverter', category: 'energy', destinationSiteCode: 'EAST', weightKg: 52, rewardCredits: 300, failurePenaltyCredits: 90, urgency: 'normal', deadlineMinute: null },
      { code: 'HAB-021', title: 'Habitat pressure frame', category: 'construction', destinationSiteCode: 'TYCH', weightKg: 148, rewardCredits: 720, failurePenaltyCredits: 180, urgency: 'normal', deadlineMinute: null },
    ],
  };
}
