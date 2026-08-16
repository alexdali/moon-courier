import type { AiRunHistoryDto, AiRunHistoryItemDto } from '@/application/dto/ai-run-history';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';

function nullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function mapRun(row: Record<string, unknown>): AiRunHistoryItemDto {
  const providerRequests = Array.isArray(row.provider_requests)
    ? row.provider_requests.filter(
        (item): item is Record<string, unknown> => typeof item === 'object' && item !== null,
      )
    : [];
  return {
    id: String(row.id ?? ''),
    missionId: nullableString(row.mission_id),
    scenarioId: nullableString(row.scenario_id),
    requestType: String(row.request_type ?? ''),
    provider: String(row.provider ?? ''),
    model: String(row.model ?? ''),
    modelRole: String(row.model_role ?? ''),
    promptVersion: String(row.prompt_version ?? ''),
    status: String(row.status ?? ''),
    inputTokens: Number(row.input_tokens ?? 0),
    outputTokens: Number(row.output_tokens ?? 0),
    cachedTokens: Number(row.cached_tokens ?? 0),
    cacheWriteTokens: Number(row.cache_write_tokens ?? 0),
    costUsd: Number(row.cost_usd ?? 0),
    latencyMs: Number(row.latency_ms ?? 0),
    request: row.request ?? null,
    providerRequests,
    errorCode: nullableString(row.error_code),
    errorMessage: nullableString(row.error_message),
    createdAt: String(row.created_at ?? ''),
    completedAt: nullableString(row.completed_at),
  };
}

export class GetAiRunHistoryUseCase {
  constructor(private readonly repositories: RepositoryBundle) {}

  execute(limit = 100): AiRunHistoryDto {
    return {
      runs: this.repositories.aiAudit.listHistory(Math.min(250, Math.max(1, limit))).map(mapRun),
    };
  }
}
