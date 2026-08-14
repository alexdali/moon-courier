import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { DomainError } from '@/domain/common/errors';
import { logger } from '@/infrastructure/logging/logger';

export function jsonOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'INVALID_REQUEST', message: 'Request validation failed', issues: error.issues }, { status: 400 });
  }
  if (error instanceof DomainError) {
    const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'CONFLICT' ? 409 : error.code === 'DISPATCH_IMPOSSIBLE' ? 422 : 400;
    return NextResponse.json({ error: error.code, message: error.message, details: error.details }, { status });
  }
  logger.error({ err: error }, 'Unhandled API error');
  return NextResponse.json({ error: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
}
