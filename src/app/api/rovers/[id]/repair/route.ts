import { z } from 'zod';
import { parseBody } from '@/app/api/_shared/body';
import { enforceApiRateLimit } from '@/app/api/_shared/rate-limit';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

const bodySchema = z.object({ missionId: z.string().min(1).optional() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const limited = enforceApiRateLimit(request, 'rover-repair');
    if (limited) return limited;
    const body = await parseBody(request, bodySchema);
    const { id } = await context.params;
    const container = ensureDemoInitialized();
    return jsonOk(container.useCases.repairRover.execute({
      roverId: id,
      ...(body.missionId ? { missionId: body.missionId } : {}),
    }));
  } catch (error) {
    return jsonError(error);
  }
}
