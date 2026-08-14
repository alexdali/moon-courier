import type { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest) {
  try {
    const missionId = request.nextUrl.searchParams.get('missionId') ?? undefined;
    const iterations = Math.min(300, Math.max(20, Number(request.nextUrl.searchParams.get('iterations') ?? 80)));
    return jsonOk(ensureDemoInitialized().useCases.analytics.execute(missionId, iterations));
  } catch (error) { return jsonError(error); }
}
