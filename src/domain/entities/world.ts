import type { EdgeId, NodeId, ScenarioId, ZoneId } from '@/domain/common/ids';

export type NodeKind = 'base' | 'colony' | 'relay' | 'charger' | 'waypoint';
export type TerrainKind = 'plain' | 'ridge' | 'crater' | 'dust' | 'shadow';

export interface MapZone {
  id: ZoneId;
  scenarioId: ScenarioId;
  name: string;
  riskMultiplier: number;
  speedMultiplier: number;
  energyMultiplier: number;
  color: string;
  polygon: readonly { x: number; y: number }[];
}

export interface MapNode {
  id: NodeId;
  scenarioId: ScenarioId;
  code: string;
  name: string;
  kind: NodeKind;
  x: number;
  y: number;
  zoneId: ZoneId | null;
  hasCharger: boolean;
}

export interface MapEdge {
  id: EdgeId;
  scenarioId: ScenarioId;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  distanceKm: number;
  terrain: TerrainKind;
  speedFactor: number;
  energyFactor: number;
  baseRisk: number;
  bidirectional: boolean;
}

export interface WorldMap {
  zones: readonly MapZone[];
  nodes: readonly MapNode[];
  edges: readonly MapEdge[];
}
