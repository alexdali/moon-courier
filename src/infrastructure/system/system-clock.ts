import type { Clock } from '@/application/ports/clock';

export class SystemClock implements Clock {
  now(): string {
    return new Date().toISOString();
  }
}
