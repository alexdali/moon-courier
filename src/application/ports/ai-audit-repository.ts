import type { AiModelRole } from '@/config/ai-models';

export interface AiRunStart {
  id: string;
  missionId: string | null;
  scenarioId: string | null;
  requestType: string;
  provider: string;
  model: string;
  modelRole: AiModelRole;
  promptVersion: string;
  request: unknown;
  createdAt: string;
}

export interface AiRunFinish {
  status: 'succeeded' | 'failed' | 'rejected';
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  response?: unknown;
  errorCode?: string;
  errorMessage?: string;
  completedAt: string;
}

export interface AiAuditRepository {
  startRun(run: AiRunStart): void;
  finishRun(id: string, finish: AiRunFinish): void;
  recordToolCall(input: {
    id: string;
    aiRunId: string;
    toolCallId: string;
    name: string;
    arguments: unknown;
    result?: unknown;
    durationMs: number;
    status: 'started' | 'succeeded' | 'failed';
    errorMessage?: string;
    createdAt: string;
  }): void;
  sumCostSince(isoTimestamp: string): number;
  listRecent(limit: number): readonly Record<string, unknown>[];
}
