import { roundTo, sum } from '@/domain/common/math';
import type { PlannedRoute, RouteObjective, RouteSegmentMetrics } from '@/domain/entities/delivery';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { MapEdge, MapNode, MapZone } from '@/domain/entities/world';
import { calculateSegmentEnergyKwh } from '@/domain/rules/energy';
import { calculateLoadRatio } from '@/domain/rules/load';
import { combineIndependentRisks, calculateSegmentIncidentRisk, incidentRiskToFailureRisk } from '@/domain/rules/risk';
import { calculateEffectiveSpeedKph, calculateTravelMinutes } from '@/domain/rules/speed';

export function calculateSegmentMetrics(input: {
  edge: MapEdge;
  fromNode: MapNode;
  toNode: MapNode;
  zone: MapZone | null;
  rover: Rover;
  order: DeliveryOrder;
}): RouteSegmentMetrics {
  const loadRatio = calculateLoadRatio(input.order.weightKg, input.rover.capacityKg);
  const zoneSpeedMultiplier = input.zone?.speedMultiplier ?? 1;
  const zoneEnergyMultiplier = input.zone?.energyMultiplier ?? 1;
  const zoneRiskMultiplier = input.zone?.riskMultiplier ?? 1;
  const speedKph = calculateEffectiveSpeedKph({
    baseSpeedKph: input.rover.baseSpeedKph,
    edgeSpeedFactor: input.edge.speedFactor,
    zoneSpeedMultiplier,
    loadRatio,
  });
  const energyKwh = calculateSegmentEnergyKwh({
    distanceKm: input.edge.distanceKm,
    baseEnergyKwhPerKm: input.rover.baseEnergyKwhPerKm,
    edgeEnergyFactor: input.edge.energyFactor,
    zoneEnergyMultiplier,
    loadRatio,
  });
  const incidentRisk = calculateSegmentIncidentRisk({
    baseRisk: input.edge.baseRisk,
    zoneRiskMultiplier,
    loadRatio,
    roverRiskResistance: input.rover.riskResistance,
  });
  return {
    edgeId: input.edge.id,
    fromNodeId: input.fromNode.id,
    toNodeId: input.toNode.id,
    distanceKm: input.edge.distanceKm,
    durationMinutes: calculateTravelMinutes(input.edge.distanceKm, speedKph),
    energyKwh,
    incidentRisk,
    failureRisk: incidentRiskToFailureRisk(incidentRisk),
  };
}

export function summarizeRoute(
  objective: RouteObjective,
  nodeIds: PlannedRoute['nodeIds'],
  segments: readonly RouteSegmentMetrics[],
): PlannedRoute {
  return {
    objective,
    nodeIds,
    segments,
    distanceKm: roundTo(sum(segments.map((segment) => segment.distanceKm)), 2),
    durationMinutes: roundTo(sum(segments.map((segment) => segment.durationMinutes)), 2),
    energyKwh: roundTo(sum(segments.map((segment) => segment.energyKwh)), 4),
    incidentRisk: combineIndependentRisks(segments.map((segment) => segment.incidentRisk)),
    failureRisk: combineIndependentRisks(segments.map((segment) => segment.failureRisk)),
  };
}
