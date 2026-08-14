import type { NextRequest } from 'next/server';
import { parseBody } from '@/app/api/_shared/body';
import { enforceApiRateLimit } from '@/app/api/_shared/rate-limit';
import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { generateScenarioRequestSchema } from '@/application/schemas/ai-requests';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const limited = enforceApiRateLimit(request, 'scenario-generation');
  if (limited) return limited;
  try {
    const input = await parseBody(request, generateScenarioRequestSchema);
    return jsonOk(await ensureDemoInitialized().useCases.generateScenario.execute({
      prompt: input.prompt,
      ...(input.seed === undefined ? {} : { seed: input.seed }),
      ...(input.difficulty ? { difficulty: input.difficulty } : {}),
      ...(input.durationDays === undefined ? {} : { durationDays: input.durationDays }),
    }), 201);
  } catch (error) { return jsonError(error); }
}
