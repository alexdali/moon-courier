import type { WorldRepository } from '@/application/ports/world-repository';
import type { ScenarioId } from '@/domain/common/ids';
import type { MapEdge, MapNode, MapZone, WorldMap } from '@/domain/entities/world';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { boolToInt, intToBool, jsonColumn } from '@/infrastructure/db/sqlite-helpers';

export class SqliteWorldRepository implements WorldRepository {
  constructor(private readonly db: SqliteDatabase) {}

  getByScenarioId(id: ScenarioId): WorldMap {
    const zones = (this.db.prepare('SELECT * FROM zones WHERE scenario_id = ? ORDER BY id').all(id) as Record<string, unknown>[]).map(mapZone);
    const nodes = (this.db.prepare('SELECT * FROM map_nodes WHERE scenario_id = ? ORDER BY id').all(id) as Record<string, unknown>[]).map(mapNode);
    const edges = (this.db.prepare('SELECT * FROM map_edges WHERE scenario_id = ? ORDER BY id').all(id) as Record<string, unknown>[]).map(mapEdge);
    return { zones, nodes, edges };
  }

  replaceForScenario(id: ScenarioId, world: WorldMap): void {
    const operation = this.db.transaction(() => {
      this.db.prepare('DELETE FROM map_edges WHERE scenario_id = ?').run(id);
      this.db.prepare('DELETE FROM map_nodes WHERE scenario_id = ?').run(id);
      this.db.prepare('DELETE FROM zones WHERE scenario_id = ?').run(id);
      const insertZone = this.db.prepare(`INSERT INTO zones
        (id, scenario_id, name, risk_multiplier, speed_multiplier, energy_multiplier, color, polygon_json)
        VALUES (@id, @scenarioId, @name, @riskMultiplier, @speedMultiplier, @energyMultiplier, @color, @polygonJson)`);
      const insertNode = this.db.prepare(`INSERT INTO map_nodes
        (id, scenario_id, code, name, kind, x, y, zone_id, has_charger)
        VALUES (@id, @scenarioId, @code, @name, @kind, @x, @y, @zoneId, @hasCharger)`);
      const insertEdge = this.db.prepare(`INSERT INTO map_edges
        (id, scenario_id, from_node_id, to_node_id, distance_km, terrain, speed_factor, energy_factor, base_risk, bidirectional)
        VALUES (@id, @scenarioId, @fromNodeId, @toNodeId, @distanceKm, @terrain, @speedFactor, @energyFactor, @baseRisk, @bidirectional)`);
      for (const zone of world.zones) insertZone.run({ ...zone, polygonJson: JSON.stringify(zone.polygon) });
      for (const node of world.nodes) insertNode.run({ ...node, hasCharger: boolToInt(node.hasCharger) });
      for (const edge of world.edges) insertEdge.run({ ...edge, bidirectional: boolToInt(edge.bidirectional) });
    });
    operation();
  }
}

function mapZone(row: Record<string, unknown>): MapZone {
  return {
    id: String(row.id), scenarioId: String(row.scenario_id), name: String(row.name),
    riskMultiplier: Number(row.risk_multiplier), speedMultiplier: Number(row.speed_multiplier),
    energyMultiplier: Number(row.energy_multiplier), color: String(row.color),
    polygon: jsonColumn(row.polygon_json, []),
  };
}
function mapNode(row: Record<string, unknown>): MapNode {
  return {
    id: String(row.id), scenarioId: String(row.scenario_id), code: String(row.code), name: String(row.name),
    kind: row.kind as MapNode['kind'], x: Number(row.x), y: Number(row.y),
    zoneId: row.zone_id === null ? null : String(row.zone_id), hasCharger: intToBool(row.has_charger),
  };
}
function mapEdge(row: Record<string, unknown>): MapEdge {
  return {
    id: String(row.id), scenarioId: String(row.scenario_id), fromNodeId: String(row.from_node_id),
    toNodeId: String(row.to_node_id), distanceKm: Number(row.distance_km), terrain: row.terrain as MapEdge['terrain'],
    speedFactor: Number(row.speed_factor), energyFactor: Number(row.energy_factor), baseRisk: Number(row.base_risk),
    bidirectional: intToBool(row.bidirectional),
  };
}
