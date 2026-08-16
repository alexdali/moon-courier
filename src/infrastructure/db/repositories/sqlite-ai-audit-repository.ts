import type {
  AiAuditRepository,
  AiRunFinish,
  AiRunStart,
} from '@/application/ports/ai-audit-repository';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { jsonColumn } from '@/infrastructure/db/sqlite-helpers';

export class SqliteAiAuditRepository implements AiAuditRepository {
  constructor(private readonly db: SqliteDatabase) {}
  startRun(run: AiRunStart): void {
    this.db
      .prepare(
        `INSERT INTO ai_runs
      (id, mission_id, scenario_id, request_type, provider, model, model_role, prompt_version, status,
       request_json, created_at)
      VALUES (@id, @missionId, @scenarioId, @requestType, @provider, @model, @modelRole, @promptVersion,
       'started', @requestJson, @createdAt)`,
      )
      .run({ ...run, requestJson: JSON.stringify(run.request) });
  }
  recordProviderRequest(id: string, request: unknown): void {
    const row = this.db
      .prepare('SELECT provider_requests_json FROM ai_runs WHERE id = ?')
      .get(id) as { provider_requests_json: string } | undefined;
    if (!row) return;
    const requests = jsonColumn<unknown[]>(row.provider_requests_json, []);
    requests.push(request);
    this.db
      .prepare('UPDATE ai_runs SET provider_requests_json = ? WHERE id = ?')
      .run(JSON.stringify(requests), id);
  }
  finishRun(id: string, finish: AiRunFinish): void {
    this.db
      .prepare(
        `UPDATE ai_runs SET status=@status, input_tokens=@inputTokens, output_tokens=@outputTokens,
      cached_tokens=@cachedTokens, cache_write_tokens=@cacheWriteTokens, cost_usd=@costUsd,
      latency_ms=@latencyMs, response_json=@responseJson, error_code=@errorCode,
      error_message=@errorMessage, completed_at=@completedAt WHERE id=@id`,
      )
      .run({
        id,
        ...finish,
        responseJson: finish.response === undefined ? null : JSON.stringify(finish.response),
        errorCode: finish.errorCode ?? null,
        errorMessage: finish.errorMessage ?? null,
      });
  }
  recordToolCall(input: Parameters<AiAuditRepository['recordToolCall']>[0]): void {
    this.db
      .prepare(
        `INSERT INTO ai_tool_calls
      (id, ai_run_id, tool_call_id, name, arguments_json, result_json, duration_ms, status, error_message, created_at)
      VALUES (@id, @aiRunId, @toolCallId, @name, @argumentsJson, @resultJson, @durationMs, @status, @errorMessage, @createdAt)
      ON CONFLICT(ai_run_id, tool_call_id) DO UPDATE SET result_json=excluded.result_json,
      duration_ms=excluded.duration_ms, status=excluded.status, error_message=excluded.error_message`,
      )
      .run({
        ...input,
        argumentsJson: JSON.stringify(input.arguments),
        resultJson: input.result === undefined ? null : JSON.stringify(input.result),
        errorMessage: input.errorMessage ?? null,
      });
  }
  sumCostSince(isoTimestamp: string): number {
    const row = this.db
      .prepare(
        "SELECT COALESCE(SUM(cost_usd), 0) AS cost FROM ai_runs WHERE created_at >= ? AND status IN ('succeeded','rejected','failed')",
      )
      .get(isoTimestamp) as { cost: number };
    return Number(row.cost);
  }
  listRecent(limit: number): readonly Record<string, unknown>[] {
    return this.db
      .prepare(
        `SELECT id, request_type, model, model_role, status, input_tokens, output_tokens,
      cached_tokens, cost_usd, latency_ms, error_code, created_at, completed_at
      FROM ai_runs ORDER BY created_at DESC LIMIT ?`,
      )
      .all(limit) as Record<string, unknown>[];
  }
  listHistory(limit: number): readonly Record<string, unknown>[] {
    const rows = this.db
      .prepare(
        `SELECT id, mission_id, scenario_id, request_type, provider, model, model_role,
      prompt_version, status, input_tokens, output_tokens, cached_tokens, cache_write_tokens, cost_usd,
      latency_ms, request_json, provider_requests_json, error_code, error_message, created_at, completed_at
      FROM ai_runs ORDER BY created_at DESC LIMIT ?`,
      )
      .all(limit) as Record<string, unknown>[];
    return rows.map((row) => ({
      ...row,
      request: jsonColumn(row.request_json, null),
      provider_requests: jsonColumn(row.provider_requests_json, []),
    }));
  }
}
