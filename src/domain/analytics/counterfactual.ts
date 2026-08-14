import type { ScenarioDefinition } from '@/domain/entities/scenario';

export type CounterfactualKey = 'baseline' | 'extra-heavy-rover' | 'faster-charging' | 'safer-routes';

export function applyCounterfactual(
  scenario: ScenarioDefinition,
  key: CounterfactualKey,
): ScenarioDefinition {
  if (key === 'baseline') return structuredClone(scenario);
  const cloned = structuredClone(scenario);
  if (key === 'extra-heavy-rover') {
    const base = cloned.roverTemplates.find((rover) => rover.code === 'ATLAS-1') ?? cloned.roverTemplates[0];
    if (base) {
      cloned.roverTemplates = [
        ...cloned.roverTemplates,
        { ...base, code: 'ATLAS-2', name: 'Atlas Reserve Rover', startingBatteryPercent: 92 },
      ];
    }
  }
  if (key === 'faster-charging') {
    cloned.rules = {
      ...cloned.rules,
      chargerMinutesPerPercent: cloned.rules.chargerMinutesPerPercent * 0.7,
      fieldChargeMinutesPerPercent: cloned.rules.fieldChargeMinutesPerPercent * 0.7,
    };
  }
  if (key === 'safer-routes') {
    cloned.world = {
      ...cloned.world,
      edges: cloned.world.edges.map((edge) => ({ ...edge, baseRisk: edge.baseRisk * 0.7 })),
    };
  }
  return cloned;
}

export const counterfactualLabels: Record<CounterfactualKey, string> = {
  baseline: 'Current fleet',
  'extra-heavy-rover': '+1 heavy rover',
  'faster-charging': '+30% charging speed',
  'safer-routes': '30% safer routes',
};
