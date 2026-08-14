import type { Clock } from '@/application/ports/clock';

export class FakeClock implements Clock {
  constructor(private value = '2026-08-15T00:00:00.000Z') {}
  now(): string { return this.value; }
  set(value: string): void { this.value = value; }
}
