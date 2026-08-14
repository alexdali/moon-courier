import type { NodeId } from '@/domain/common/ids';
import type { PlannedRoute, RouteObjective, RouteSegmentMetrics } from '@/domain/entities/delivery';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { WorldMap } from '@/domain/entities/world';
import { calculateSegmentMetrics, summarizeRoute } from '@/domain/rules/route-metrics';
import { buildWorldGraph, type GraphArc, type WorldGraph } from '@/domain/routing/graph';
import { dijkstra } from '@/domain/routing/dijkstra';

/**
 * Plans the complete operational route:
 * 1. empty rover approach from its current node to the order origin;
 * 2. loaded delivery from the order origin to its destination.
 *
 * This prevents cargo from "teleporting" to a rover that finished the previous
 * delivery away from the base. Weight affects only the loaded leg, while the
 * approach still consumes time, battery and carries terrain risk.
 */
export function planRoute(input: {
  world: WorldMap;
  rover: Rover;
  order: DeliveryOrder;
  objective: RouteObjective;
}): PlannedRoute | null {
  const graph = buildWorldGraph(input.world);
  const zones = new Map(input.world.zones.map((zone) => [zone.id, zone]));
  const emptyOrder: DeliveryOrder = { ...input.order, weightKg: 0 };

  const approach = planLeg({
    graph,
    startNodeId: input.rover.nodeId,
    destinationNodeId: input.order.originNodeId,
    rover: input.rover,
    order: emptyOrder,
    objective: input.objective,
    zones,
  });
  if (!approach) return null;

  const loaded = planLeg({
    graph,
    startNodeId: input.order.originNodeId,
    destinationNodeId: input.order.destinationNodeId,
    rover: input.rover,
    order: input.order,
    objective: input.objective,
    zones,
  });
  if (!loaded) return null;

  const nodeIds = [...approach.nodeIds, ...loaded.nodeIds.slice(1)];
  return summarizeRoute(input.objective, nodeIds, [...approach.segments, ...loaded.segments]);
}

interface PlannedLeg {
  nodeIds: readonly NodeId[];
  segments: readonly RouteSegmentMetrics[];
}

function planLeg(input: {
  graph: WorldGraph;
  startNodeId: NodeId;
  destinationNodeId: NodeId;
  rover: Rover;
  order: DeliveryOrder;
  objective: RouteObjective;
  zones: ReadonlyMap<string, WorldMap['zones'][number]>;
}): PlannedLeg | null {
  const metricOf = (arc: GraphArc) =>
    calculateSegmentMetrics({
      edge: arc.edge,
      fromNode: arc.fromNode,
      toNode: arc.toNode,
      zone: arc.toNode.zoneId ? input.zones.get(arc.toNode.zoneId) ?? null : null,
      rover: input.rover,
      order: input.order,
    });

  const path = dijkstra(input.graph, input.startNodeId, input.destinationNodeId, (arc) => {
    const metric = metricOf(arc);
    switch (input.objective) {
      case 'fastest':
        return metric.durationMinutes;
      case 'safest':
        return -Math.log(Math.max(0.0001, 1 - metric.failureRisk));
      case 'efficient':
        return metric.energyKwh;
      case 'balanced':
        return metric.durationMinutes * 0.45 + metric.energyKwh * 1.8 + metric.failureRisk * 180;
    }
  });

  if (!path) return null;
  return { nodeIds: path.nodeIds, segments: path.arcs.map(metricOf) };
}
