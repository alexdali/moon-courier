import type { MapEdge, MapNode, WorldMap } from '@/domain/entities/world';
import type { NodeId } from '@/domain/common/ids';

export interface GraphArc {
  edge: MapEdge;
  fromNode: MapNode;
  toNode: MapNode;
}

export interface WorldGraph {
  nodes: ReadonlyMap<NodeId, MapNode>;
  adjacency: ReadonlyMap<NodeId, readonly GraphArc[]>;
}

export function buildWorldGraph(world: WorldMap): WorldGraph {
  const nodes = new Map(world.nodes.map((node) => [node.id, node]));
  const adjacency = new Map<NodeId, GraphArc[]>();
  for (const node of world.nodes) adjacency.set(node.id, []);
  for (const edge of world.edges) {
    const fromNode = nodes.get(edge.fromNodeId);
    const toNode = nodes.get(edge.toNodeId);
    if (!fromNode || !toNode) continue;
    adjacency.get(fromNode.id)?.push({ edge, fromNode, toNode });
    if (edge.bidirectional) {
      adjacency.get(toNode.id)?.push({ edge, fromNode: toNode, toNode: fromNode });
    }
  }
  return { nodes, adjacency };
}
