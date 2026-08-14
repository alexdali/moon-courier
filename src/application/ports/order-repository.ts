import type { MissionId, OrderId } from '@/domain/common/ids';
import type { DeliveryOrder } from '@/domain/entities/order';

export interface OrderRepository {
  listByMission(missionId: MissionId): readonly DeliveryOrder[];
  getById(id: OrderId): DeliveryOrder | null;
  insertMany(orders: readonly DeliveryOrder[]): void;
  update(order: DeliveryOrder): void;
  deleteByMission(missionId: MissionId): void;
}
