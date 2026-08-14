import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export async function POST() {
  try {
    const container = ensureDemoInitialized();
    const missionId = container.useCases.resetDemo.execute();
    return jsonOk(container.useCases.dashboard.execute(missionId));
  } catch (error) { return jsonError(error); }
}
