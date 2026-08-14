interface Bucket {
  startedAt: number;
  count: number;
}

const buckets = new Map<string, Bucket>();

export function consumeRateLimit(key: string, limit: number, windowMs = 60_000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const current = buckets.get(key);
  const bucket = !current || now - current.startedAt >= windowMs ? { startedAt: now, count: 0 } : current;
  bucket.count += 1;
  buckets.set(key, bucket);
  if (buckets.size > 2_000) cleanup(now, windowMs);
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count) };
}

function cleanup(now: number, windowMs: number): void {
  for (const [key, bucket] of buckets) if (now - bucket.startedAt > windowMs * 2) buckets.delete(key);
}
