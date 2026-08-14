import { describe, expect, it } from 'vitest';
import { combineSeed, SeededRandom } from '@/domain/common/seeded-random';

describe('seeded random', () => {
  it('reproduces sequences', () => {
    const a = new SeededRandom(42); const b = new SeededRandom(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
    expect(combineSeed('mission', 1)).toBe(combineSeed('mission', 1));
  });
});
