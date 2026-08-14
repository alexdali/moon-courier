import type { MissionStatus } from '@/domain/entities/mission';
import { ValidationError } from '@/domain/common/errors';

const allowed: Record<MissionStatus, readonly MissionStatus[]> = {
  ready: ['active'],
  active: ['paused', 'completed', 'failed'],
  paused: ['active', 'failed'],
  completed: [],
  failed: [],
};

export function assertMissionTransition(from: MissionStatus, to: MissionStatus): void {
  if (!allowed[from].includes(to)) {
    throw new ValidationError(`Invalid mission transition ${from} -> ${to}`);
  }
}
