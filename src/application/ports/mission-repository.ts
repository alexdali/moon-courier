import type { MissionId } from '@/domain/common/ids';
import type { Mission } from '@/domain/entities/mission';

export interface MissionRepository {
  getById(id: MissionId): Mission | null;
  getCurrent(): Mission | null;
  create(mission: Mission): void;
  update(mission: Mission): void;
  deleteAll(): void;
}
