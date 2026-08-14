import { NextResponse } from 'next/server';
import { getEnv } from '@/config/env';
import { consumeRateLimit } from '@/infrastructure/security/rate-limiter';
import { requestIdentity } from '@/infrastructure/security/request-identity';

export function enforceApiRateLimit(request: Request, scope: string): NextResponse | null {
  const env = getEnv();
  const result = consumeRateLimit(`${scope}:${requestIdentity(request)}`, env.API_RATE_LIMIT_PER_MINUTE);
  if (result.allowed) return null;
  return NextResponse.json({ error: 'RATE_LIMITED', message: 'Too many requests. Try again in a minute.' }, { status: 429 });
}
