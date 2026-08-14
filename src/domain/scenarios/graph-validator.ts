import type { ScenarioDefinition } from '@/domain/entities/scenario';
import { buildWorldGraph } from '@/domain/routing/graph';

export function isScenarioGraphConnected(scenario: ScenarioDefinition): boolean {
  const graph = buildWorldGraph(scenario.world);
  const start = scenario.world.nodes[0]?.id;
  if (!start) return false;
  const visited = new Set<string>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const arc of graph.adjacency.get(current) ?? []) {
      if (!visited.has(arc.toNode.id)) {
        visited.add(arc.toNode.id);
        queue.push(arc.toNode.id);
      }
    }
  }
  return visited.size === scenario.world.nodes.length;
}
