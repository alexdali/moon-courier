export interface AiRunHistoryItemDto {
  id: string;
  missionId: string | null;
  scenarioId: string | null;
  requestType: string;
  provider: string;
  model: string;
  modelRole: string;
  promptVersion: string;
  status: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  latencyMs: number;
  request: unknown;
  providerRequests: readonly Record<string, unknown>[];
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AiRunHistoryDto {
  runs: readonly AiRunHistoryItemDto[];
}
