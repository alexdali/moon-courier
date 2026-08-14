import type { ScenarioDefinition } from '@/domain/entities/scenario';
import type { MapEdge, MapNode, MapZone, TerrainKind } from '@/domain/entities/world';
import type { ScenarioBlueprint } from '@/domain/scenarios/blueprint';
import { mapDistanceKm } from '@/domain/scenarios/geometry';

const terrainProfile: Record<TerrainKind, { speed: number; energy: number; risk: number; color: string }> = {
  plain: { speed: 1, energy: 1, risk: 0.04, color: '#42d9ff' },
  ridge: { speed: 0.72, energy: 1.28, risk: 0.12, color: '#ffb653' },
  crater: { speed: 0.66, energy: 1.34, risk: 0.16, color: '#ff8b53' },
  dust: { speed: 0.82, energy: 1.18, risk: 0.1, color: '#a98bff' },
  shadow: { speed: 0.76, energy: 1.22, risk: 0.22, color: '#ff5c73' },
};

export function compileScenarioBlueprint(blueprint: ScenarioBlueprint): ScenarioDefinition {
  const scenarioId = `scenario_${slug(blueprint.title)}_${blueprint.seed}`;
  const baseSite = blueprint.sites.find((site) => site.kind === 'base') ?? blueprint.sites[0];
  if (!baseSite) throw new Error('Blueprint must contain at least one site');
  const zones: MapZone[] = blueprint.sites.map((site, index) => {
    const profile = terrainProfile[site.environment];
    return {
      id: `${scenarioId}_zone_${index + 1}`,
      scenarioId,
      name: `${site.name} ${site.environment} sector`,
      riskMultiplier: 1 + profile.risk * 2,
      speedMultiplier: profile.speed,
      energyMultiplier: profile.energy,
      color: profile.color,
      polygon: squareAround(site.x, site.y, 8),
    };
  });
  const nodes: MapNode[] = blueprint.sites.map((site, index) => ({
    id: `${scenarioId}_node_${site.code.toLowerCase()}`,
    scenarioId,
    code: site.code,
    name: site.name,
    kind: site.kind,
    x: site.x,
    y: site.y,
    zoneId: zones[index]!.id,
    hasCharger: site.hasCharger,
  }));
  const nodeByCode = new Map(nodes.map((node) => [node.code, node]));
  const edges = buildConnectedEdges(scenarioId, nodes, blueprint.sites.map((site) => site.environment));
  const maxCapacity = Math.max(...blueprint.rovers.map((rover) => rover.capacityKg), 0);
  const orders = blueprint.orders.map((order) => ({
    code: order.code,
    title: order.title,
    category: order.category,
    originNodeId: nodeByCode.get(baseSite.code)?.id ?? nodes[0]!.id,
    destinationNodeId: nodeByCode.get(order.destinationSiteCode)?.id ?? nodes.at(-1)!.id,
    weightKg: order.weightKg,
    rewardCredits: order.rewardCredits,
    failurePenaltyCredits: order.failurePenaltyCredits,
    urgency: order.urgency,
    deadlineMinute: order.deadlineMinute,
  }));
  if (!orders.some((order) => order.weightKg > maxCapacity)) {
    const destination = nodes.find((node) => node.kind !== 'base') ?? nodes.at(-1)!;
    orders.push({
      code: 'IMP-001',
      title: 'Oversized habitat frame',
      category: 'construction',
      originNodeId: nodeByCode.get(baseSite.code)?.id ?? nodes[0]!.id,
      destinationNodeId: destination.id,
      weightKg: maxCapacity + 25,
      rewardCredits: 850,
      failurePenaltyCredits: 200,
      urgency: 'normal',
      deadlineMinute: null,
    });
  }
  return {
    id: scenarioId,
    name: blueprint.title,
    description: `${blueprint.summary}\n\n${blueprint.demandNarrative}`,
    seed: blueprint.seed,
    difficulty: blueprint.difficulty,
    source: 'ai',
    rules: {
      durationDays: blueprint.durationDays,
      startingCredits: blueprint.startingCredits,
      targetCredits: blueprint.targetCredits,
      minimumBatteryReservePercent: 12,
      energyPriceCreditsPerKwh: 4,
      latePenaltyCreditsPerMinute: 1.5,
      riskDelayMinutes: 12,
      incidentBatteryLossPercent: 7,
      chargerMinutesPerPercent: 0.35,
      fieldChargeMinutesPerPercent: 1.2,
      chargingCostCreditsPerKwh: 1.2,
      repairDurationMinutes: 120,
      requireImpossibleOrder: true,
    },
    world: { zones, nodes, edges },
    roverTemplates: blueprint.rovers.map((rover) => ({
      ...rover,
      baseEnergyKwhPerKm: 0.28 + rover.capacityKg / 500,
      repairCostCredits: 60 + rover.capacityKg,
      startingNodeId: nodeByCode.get(baseSite.code)?.id ?? nodes[0]!.id,
      startingStatus: 'available',
    })),
    orderTemplates: orders,
  };
}

function buildConnectedEdges(
  scenarioId: string,
  nodes: readonly MapNode[],
  terrains: readonly TerrainKind[],
): MapEdge[] {
  const sorted = [...nodes].sort((left, right) => left.x - right.x || left.y - right.y);
  const pairs = new Map<string, [MapNode, MapNode]>();
  for (let index = 1; index < sorted.length; index += 1) addPair(pairs, sorted[index - 1]!, sorted[index]!);
  for (const node of nodes) {
    const nearest = [...nodes]
      .filter((candidate) => candidate.id !== node.id)
      .sort((left, right) => mapDistanceKm(node, left) - mapDistanceKm(node, right))
      .slice(0, 2);
    for (const candidate of nearest) addPair(pairs, node, candidate);
  }
  return [...pairs.values()].map(([fromNode, toNode], index) => {
    const toIndex = nodes.findIndex((node) => node.id === toNode.id);
    const terrain = terrains[toIndex] ?? 'plain';
    const profile = terrainProfile[terrain];
    return {
      id: `${scenarioId}_edge_${index + 1}`,
      scenarioId,
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
      distanceKm: mapDistanceKm(fromNode, toNode),
      terrain,
      speedFactor: profile.speed,
      energyFactor: profile.energy,
      baseRisk: profile.risk,
      bidirectional: true,
    };
  });
}

function addPair(target: Map<string, [MapNode, MapNode]>, left: MapNode, right: MapNode): void {
  const key = [left.id, right.id].sort().join('::');
  target.set(key, [left, right]);
}

function squareAround(x: number, y: number, radius: number): readonly { x: number; y: number }[] {
  return [
    { x: x - radius, y: y - radius },
    { x: x + radius, y: y - radius },
    { x: x + radius, y: y + radius },
    { x: x - radius, y: y + radius },
  ];
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32) || 'mission';
}
