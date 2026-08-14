import type { NextRequest } from 'next/server';
import { parseBody } from '@/app/api/_shared/body';
import { enforceApiRateLimit } from '@/app/api/_shared/rate-limit';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { missionControlRequestSchema } from '@/application/schemas/ai-requests';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const limited = enforceApiRateLimit(request, 'ai-assistant');
  if (limited) return limited;
  try {
    const input = await parseBody(request, missionControlRequestSchema);
    return jsonOk(await ensureDemoInitialized().useCases.askMissionControl.execute({
      missionId: input.missionId,
      message: input.message,
      ...(input.selectedOrderId ? { selectedOrderId: input.selectedOrderId } : {}),
      ...(input.selectedRoverId ? { selectedRoverId: input.selectedRoverId } : {}),
    }));
  } catch (error) { return jsonError(error); }
}
