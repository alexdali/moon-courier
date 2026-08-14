import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { parseBody } from '@/app/api/_shared/body';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

const schema = z.object({
  missionId: z.string().optional(),
  iterations: z.number().int().min(20).max(1_000).default(200),
  options: z.array(z.enum(['baseline', 'extra-heavy-rover', 'faster-charging', 'safer-routes'])).optional(),
});
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    const input = await parseBody(request, schema);
    return jsonOk(ensureDemoInitialized().useCases.runComparison.execute({
      iterations: input.iterations,
      ...(input.missionId ? { missionId: input.missionId } : {}),
      ...(input.options ? { options: input.options } : {}),
    }), 201);
  } catch (error) { return jsonError(error); }
}
