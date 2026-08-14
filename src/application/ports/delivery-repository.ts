import type { DeliveryId, MissionId } from '@/domain/common/ids';
import type { Delivery } from '@/domain/entities/delivery';
import type { SegmentResolution } from '@/domain/simulation/delivery-resolver';

export interface DeliveryRepository {
  getById(id: DeliveryId): Delivery | null;
  getByIdempotencyKey(key: string): Delivery | null;
  listByMission(missionId: MissionId): readonly Delivery[];
  insert(delivery: Delivery, segments: readonly SegmentResolution[]): void;
  deleteByMission(missionId: MissionId): void;
}
