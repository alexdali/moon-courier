import type { DeliveryRepository } from '@/application/ports/delivery-repository';
import type { DeliveryId, MissionId } from '@/domain/common/ids';
import type { Delivery } from '@/domain/entities/delivery';
import type { SegmentResolution } from '@/domain/simulation/delivery-resolver';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { mapDelivery } from '@/infrastructure/db/row-mappers';

export class SqliteDeliveryRepository implements DeliveryRepository {
  constructor(private readonly db: SqliteDatabase) {}
  getById(id: DeliveryId): Delivery | null {
    const row = this.db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? mapDelivery(row) : null;
  }
  getByIdempotencyKey(key: string): Delivery | null {
    const row = this.db.prepare('SELECT * FROM deliveries WHERE idempotency_key = ?').get(key) as Record<string, unknown> | undefined;
    return row ? mapDelivery(row) : null;
  }
  listByMission(missionId: MissionId): readonly Delivery[] {
    return (this.db.prepare('SELECT * FROM deliveries WHERE mission_id = ? ORDER BY started_at, id').all(missionId) as Record<string, unknown>[]).map(mapDelivery);
  }
  insert(delivery: Delivery, segments: readonly SegmentResolution[]): void {
    const insertDelivery = this.db.prepare(`INSERT INTO deliveries
      (id, mission_id, order_id, rover_id, status, route_json, planned_distance_km, planned_duration_minutes,
       planned_energy_kwh, planned_incident_risk, expected_net_credits, actual_net_credits, seed, idempotency_key,
       failure_code, started_at, completed_at, created_at)
      VALUES (@id, @missionId, @orderId, @roverId, @status, @routeJson, @distanceKm, @durationMinutes,
       @energyKwh, @incidentRisk, @expectedNetCredits, @actualNetCredits, @seed, @idempotencyKey,
       @failureCode, @startedAt, @completedAt, @createdAt)`);
    const insertSegment = this.db.prepare(`INSERT INTO delivery_segments
      (id, delivery_id, sequence, edge_id, distance_km, duration_minutes, energy_kwh, incident_risk, outcome, event_json)
      VALUES (@id, @deliveryId, @sequence, @edgeId, @distanceKm, @durationMinutes, @energyKwh, @incidentRisk, @outcome, @eventJson)`);
    this.db.transaction(() => {
      insertDelivery.run({
        ...delivery,
        routeJson: JSON.stringify(delivery.route),
        distanceKm: delivery.route.distanceKm,
        durationMinutes: delivery.route.durationMinutes,
        energyKwh: delivery.route.energyKwh,
        incidentRisk: delivery.route.incidentRisk,
        createdAt: delivery.startedAt,
      });
      for (const segment of segments) {
        const planned = delivery.route.segments[segment.sequence - 1];
        if (!planned) continue;
        insertSegment.run({
          id: `${delivery.id}_segment_${segment.sequence}`,
          deliveryId: delivery.id,
          sequence: segment.sequence,
          edgeId: segment.edgeId,
          distanceKm: planned.distanceKm,
          durationMinutes: segment.durationMinutes,
          energyKwh: segment.energyKwh,
          incidentRisk: planned.incidentRisk,
          outcome: segment.outcome,
          eventJson: JSON.stringify({ incidentRoll: segment.incidentRoll, severityRoll: segment.severityRoll }),
        });
      }
    })();
  }
  deleteByMission(missionId: MissionId): void { this.db.prepare('DELETE FROM deliveries WHERE mission_id = ?').run(missionId); }
}
