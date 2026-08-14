import type { NodeId } from '@/domain/common/ids';
import type { GraphArc, WorldGraph } from '@/domain/routing/graph';

export interface GraphPath {
  nodeIds: readonly NodeId[];
  arcs: readonly GraphArc[];
  cost: number;
}

export function dijkstra(
  graph: WorldGraph,
  startNodeId: NodeId,
  destinationNodeId: NodeId,
  costOf: (arc: GraphArc) => number,
): GraphPath | null {
  const distances = new Map<NodeId, number>();
  const previous = new Map<NodeId, { nodeId: NodeId; arc: GraphArc }>();
  const unvisited = new Set(graph.nodes.keys());
  for (const nodeId of unvisited) distances.set(nodeId, Number.POSITIVE_INFINITY);
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let current: NodeId | null = null;
    let currentDistance = Number.POSITIVE_INFINITY;
    for (const nodeId of unvisited) {
      const distance = distances.get(nodeId) ?? Number.POSITIVE_INFINITY;
      if (distance < currentDistance) {
        current = nodeId;
        currentDistance = distance;
      }
    }
    if (current === null || !Number.isFinite(currentDistance)) break;
    if (current === destinationNodeId) break;
    unvisited.delete(current);
    for (const arc of graph.adjacency.get(current) ?? []) {
      if (!unvisited.has(arc.toNode.id)) continue;
      const candidate = currentDistance + Math.max(0.000001, costOf(arc));
      if (candidate < (distances.get(arc.toNode.id) ?? Number.POSITIVE_INFINITY)) {
        distances.set(arc.toNode.id, candidate);
        previous.set(arc.toNode.id, { nodeId: current, arc });
      }
    }
  }

  const destinationDistance = distances.get(destinationNodeId);
  if (destinationDistance === undefined || !Number.isFinite(destinationDistance)) return null;
  const arcs: GraphArc[] = [];
  const nodeIds: NodeId[] = [destinationNodeId];
  let cursor = destinationNodeId;
  while (cursor !== startNodeId) {
    const step = previous.get(cursor);
    if (!step) return null;
    arcs.unshift(step.arc);
    nodeIds.unshift(step.nodeId);
    cursor = step.nodeId;
  }
  return { nodeIds, arcs, cost: destinationDistance };
}
