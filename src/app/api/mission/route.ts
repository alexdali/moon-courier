import type { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  try {
    const missionId = request.nextUrl.searchParams.get('missionId') ?? undefined;
    return jsonOk(ensureDemoInitialized().useCases.dashboard.execute(missionId));
  } catch (error) { return jsonError(error); }
}
