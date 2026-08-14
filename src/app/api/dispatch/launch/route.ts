import type { NextRequest } from 'next/server';
import { parseBody } from '@/app/api/_shared/body';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { launchDeliveryRequestSchema } from '@/application/schemas/dispatch-requests';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    const input = await parseBody(request, launchDeliveryRequestSchema);
    return jsonOk(ensureDemoInitialized().useCases.launchDelivery.execute(input), 201);
  } catch (error) { return jsonError(error); }
}
