import type { Delivery } from '@/domain/entities/delivery';
import type { EconomyEntry } from '@/domain/entities/economy';
import type { MissionEvent } from '@/domain/entities/event';
import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';
import type { SimulationRun } from '@/domain/entities/simulation';
import { jsonColumn, intToBool, requiredJsonColumn } from '@/infrastructure/db/sqlite-helpers';

export function mapMission(row: Record<string, unknown>): Mission {
  return {
    id: String(row.id),
    scenarioId: String(row.scenario_id),
    name: String(row.name),
    status: row.status as Mission['status'],
    currentMinute: Number(row.current_minute),
    currentDay: Number(row.current_day),
    credits: Number(row.credits),
    score: Number(row.score),
    rating: Number(row.rating),
    targetCredits: Number(row.target_credits),
    seed: Number(row.seed),
    startedAt: row.started_at === null ? null : String(row.started_at),
    endedAt: row.ended_at === null ? null : String(row.ended_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapRover(row: Record<string, unknown>): Rover {
  return {
    id: String(row.id),
    missionId: String(row.mission_id),
    code: String(row.code),
    name: String(row.name),
    status: row.status as Rover['status'],
    nodeId: String(row.node_id),
    batteryPercent: Number(row.battery_percent),
    batteryCapacityKwh: Number(row.battery_capacity_kwh),
    capacityKg: Number(row.capacity_kg),
    baseSpeedKph: Number(row.base_speed_kph),
    baseEnergyKwhPerKm: Number(row.base_energy_kwh_per_km),
    riskResistance: Number(row.risk_resistance),
    repairCostCredits: Number(row.repair_cost_credits),
    metadata: jsonColumn(row.metadata_json, {}),
  };
}

export function mapOrder(row: Record<string, unknown>): DeliveryOrder {
  return {
    id: String(row.id),
    missionId: String(row.mission_id),
    code: String(row.code),
    title: String(row.title),
    category: String(row.category),
    originNodeId: String(row.origin_node_id),
    destinationNodeId: String(row.destination_node_id),
    weightKg: Number(row.weight_kg),
    rewardCredits: Number(row.reward_credits),
    failurePenaltyCredits: Number(row.failure_penalty_credits),
    urgency: row.urgency as DeliveryOrder['urgency'],
    deadlineMinute: row.deadline_minute === null ? null : Number(row.deadline_minute),
    status: row.status as DeliveryOrder['status'],
    impossibleReason: row.impossible_reason === null ? null : String(row.impossible_reason),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapDelivery(row: Record<string, unknown>): Delivery {
  return {
    id: String(row.id),
    missionId: String(row.mission_id),
    orderId: String(row.order_id),
    roverId: String(row.rover_id),
    status: row.status as Delivery['status'],
    route: requiredJsonColumn<Delivery['route']>(row.route_json, 'deliveries.route_json'),
    expectedNetCredits: Number(row.expected_net_credits),
    actualNetCredits: row.actual_net_credits === null ? null : Number(row.actual_net_credits),
    seed: Number(row.seed),
    idempotencyKey: String(row.idempotency_key),
    failureCode: row.failure_code === null ? null : (row.failure_code as Delivery['failureCode']),
    startedAt: String(row.started_at),
    completedAt: row.completed_at === null ? null : String(row.completed_at),
  };
}

export function mapEvent(row: Record<string, unknown>): MissionEvent {
  return {
    id: String(row.id),
    missionId: String(row.mission_id),
    deliveryId: row.delivery_id === null ? null : String(row.delivery_id),
    sequence: Number(row.sequence),
    type: row.type as MissionEvent['type'],
    severity: row.severity as MissionEvent['severity'],
    title: String(row.title),
    message: String(row.message),
    payload: jsonColumn(row.payload_json, {}),
    occurredAt: String(row.occurred_at),
    simulationOffsetMs: Number(row.simulation_offset_ms),
  };
}

export function mapEconomyEntry(row: Record<string, unknown>): EconomyEntry {
  return {
    id: String(row.id),
    missionId: String(row.mission_id),
    deliveryId: row.delivery_id === null ? null : String(row.delivery_id),
    eventId: row.event_id === null ? null : String(row.event_id),
    type: row.type as EconomyEntry['type'],
    amountCredits: Number(row.amount_credits),
    balanceAfter: Number(row.balance_after),
    description: String(row.description),
    createdAt: String(row.created_at),
  };
}

export function mapSimulationRun(row: Record<string, unknown>): SimulationRun {
  return {
    id: String(row.id),
    missionId: row.mission_id === null ? null : String(row.mission_id),
    scenarioId: String(row.scenario_id),
    kind: row.kind as SimulationRun['kind'],
    policy: requiredJsonColumn<SimulationRun['policy']>(row.policy_json, 'simulation_runs.policy_json'),
    seed: Number(row.seed),
    iterations: Number(row.iterations),
    status: row.status as SimulationRun['status'],
    summary: row.summary_json === null ? null : jsonColumn(row.summary_json, null),
    startedAt: String(row.started_at),
    completedAt: row.completed_at === null ? null : String(row.completed_at),
    error: row.error === null ? null : String(row.error),
  };
}

export { intToBool };
