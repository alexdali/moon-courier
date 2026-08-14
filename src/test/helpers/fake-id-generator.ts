import type { IdGenerator } from '@/application/ports/id-generator';

export class FakeIdGenerator implements IdGenerator {
  private sequence = 0;
  next(prefix: string): string { this.sequence += 1; return `${prefix}_test_${this.sequence}`; }
}
