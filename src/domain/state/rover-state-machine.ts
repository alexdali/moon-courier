import type { RoverStatus } from '@/domain/entities/rover';
import { ValidationError } from '@/domain/common/errors';

const allowed: Record<RoverStatus, readonly RoverStatus[]> = {
  available: ['assigned', 'charging', 'disabled'],
  assigned: ['en_route', 'available', 'disabled'],
  en_route: ['available', 'damaged', 'disabled'],
  charging: ['available', 'disabled'],
  damaged: ['charging', 'available', 'disabled'],
  disabled: ['available'],
};

export function assertRoverTransition(from: RoverStatus, to: RoverStatus): void {
  if (!allowed[from].includes(to)) {
    throw new ValidationError(`Invalid rover transition ${from} -> ${to}`);
  }
}
