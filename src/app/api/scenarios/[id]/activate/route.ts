import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const container = ensureDemoInitialized();
    const missionId = container.useCases.activateScenario.execute(id);
    return jsonOk(container.useCases.dashboard.execute(missionId), 201);
  } catch (error) { return jsonError(error); }
}
