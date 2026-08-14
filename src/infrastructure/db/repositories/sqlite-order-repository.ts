import type { OrderRepository } from '@/application/ports/order-repository';
import type { MissionId, OrderId } from '@/domain/common/ids';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { mapOrder } from '@/infrastructure/db/row-mappers';

export class SqliteOrderRepository implements OrderRepository {
  constructor(private readonly db: SqliteDatabase) {}
  listByMission(missionId: MissionId): readonly DeliveryOrder[] {
    return (this.db.prepare(`SELECT * FROM orders WHERE mission_id = ? ORDER BY
      CASE urgency WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, code`).all(missionId) as Record<string, unknown>[]).map(mapOrder);
  }
  getById(id: OrderId): DeliveryOrder | null {
    const row = this.db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? mapOrder(row) : null;
  }
  insertMany(orders: readonly DeliveryOrder[]): void {
    const statement = this.db.prepare(`INSERT INTO orders
      (id, mission_id, code, title, category, origin_node_id, destination_node_id, weight_kg, reward_credits,
       failure_penalty_credits, urgency, deadline_minute, status, impossible_reason, created_at, updated_at)
      VALUES (@id, @missionId, @code, @title, @category, @originNodeId, @destinationNodeId, @weightKg, @rewardCredits,
       @failurePenaltyCredits, @urgency, @deadlineMinute, @status, @impossibleReason, @createdAt, @updatedAt)`);
    this.db.transaction(() => orders.forEach((order) => statement.run(order)))();
  }
  update(order: DeliveryOrder): void {
    this.db.prepare(`UPDATE orders SET status=@status, impossible_reason=@impossibleReason, updated_at=@updatedAt WHERE id=@id`).run(order);
  }
  deleteByMission(missionId: MissionId): void { this.db.prepare('DELETE FROM orders WHERE mission_id = ?').run(missionId); }
}
