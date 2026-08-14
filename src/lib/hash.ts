import { createHash } from 'node:crypto';
import { stableJson } from '@/lib/json';

export function sha256(value: string | object): string {
  const source = typeof value === 'string' ? value : stableJson(value);
  return createHash('sha256').update(source).digest('hex');
}
