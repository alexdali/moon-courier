import type { NextRequest } from 'next/server';
import { parseBody } from '@/app/api/_shared/body';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { dispatchPreviewRequestSchema } from '@/application/schemas/dispatch-requests';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    const input = await parseBody(request, dispatchPreviewRequestSchema);
    return jsonOk(ensureDemoInitialized().useCases.previewDispatch.execute(input));
  } catch (error) { return jsonError(error); }
}
