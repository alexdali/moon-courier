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
  totals: {
    requestCount: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    cacheWriteTokens: number;
    costUsd: number;
  };
  dailyCosts: readonly {
    date: string;
    requestCount: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    costUsd: number;
  }[];
  runs: readonly AiRunHistoryItemDto[];
}
