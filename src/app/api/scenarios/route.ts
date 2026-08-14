import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export function GET() {
  try { return jsonOk(ensureDemoInitialized().useCases.listScenarios.execute()); }
  catch (error) { return jsonError(error); }
}
