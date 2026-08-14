import { jsonError, jsonOk } from '@/app/api/_shared/responses';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  try {
    const container = ensureDemoInitialized();
    const row = container.db.prepare('SELECT 1 AS ok').get() as { ok: number };
    return jsonOk({
      status: row.ok === 1 ? 'ok' : 'degraded',
      database: row.ok === 1 ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      ai: {
        enabled: container.env.AI_ENABLED && container.env.OPENROUTER_API_KEY.length > 0,
        primaryModel: container.env.AI_PRIMARY_MODEL,
        fallbackModel: container.env.AI_FALLBACK_MODEL,
        localModelImplemented: false,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
