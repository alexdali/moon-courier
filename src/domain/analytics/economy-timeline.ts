import type { EconomyEntry } from '@/domain/entities/economy';
import type { EconomyPoint } from '@/domain/entities/analytics';

export function buildEconomyTimeline(entries: readonly EconomyEntry[]): readonly EconomyPoint[] {
  return [...entries]
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
    .map((entry, index) => ({
      sequence: index + 1,
      label: labelForEntry(entry, index + 1),
      balance: entry.balanceAfter,
      delta: entry.amountCredits,
    }));
}

function labelForEntry(entry: EconomyEntry, sequence: number): string {
  if (entry.type === 'initial') return 'Start';
  if (entry.deliveryId) return `D${sequence}`;
  return `E${sequence}`;
}
