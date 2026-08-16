import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers/test-context';

const openDatabases: { close(): void }[] = [];
afterEach(() => {
  while (openDatabases.length) openDatabases.pop()?.close();
});

describe('AI audit repository', () => {
  it('persists model attempts and tool-call transitions', () => {
    const context = createTestContext();
    openDatabases.push(context.db);
    context.repositories.aiAudit.startRun({
      id: 'ai_run_test',
      missionId: null,
      scenarioId: null,
      requestType: 'test',
      provider: 'openrouter',
      model: 'deepseek/deepseek-v4-flash-0731',
      modelRole: 'primary',
      promptVersion: 'test-v1',
      request: { hello: 'world' },
      createdAt: '2026-08-15T00:00:00.000Z',
    });
    context.repositories.aiAudit.recordProviderRequest('ai_run_test', {
      model: 'deepseek/deepseek-v4-flash-0731',
      messages: [{ role: 'user', content: 'Recommend a dispatch' }],
      max_tokens: 1000,
    });
    context.repositories.aiAudit.recordToolCall({
      id: 'ai_run_test_tool_1',
      aiRunId: 'ai_run_test',
      toolCallId: 'tool_1',
      name: 'get_mission_summary',
      arguments: {},
      durationMs: 0,
      status: 'started',
      createdAt: '2026-08-15T00:00:00.000Z',
    });
    context.repositories.aiAudit.recordToolCall({
      id: 'ai_run_test_tool_1',
      aiRunId: 'ai_run_test',
      toolCallId: 'tool_1',
      name: 'get_mission_summary',
      arguments: {},
      result: { ok: true },
      durationMs: 8,
      status: 'succeeded',
      createdAt: '2026-08-15T00:00:00.000Z',
    });
    context.repositories.aiAudit.finishRun('ai_run_test', {
      status: 'succeeded',
      inputTokens: 120,
      outputTokens: 30,
      costUsd: 0.00002,
      latencyMs: 120,
      cachedTokens: 80,
      cacheWriteTokens: 12,
      response: { ok: true },
      completedAt: '2026-08-15T00:00:01.000Z',
    });

    expect(context.repositories.aiAudit.listRecent(5)[0]?.status).toBe('succeeded');
    const history = context.repositories.aiAudit.listHistory(5)[0];
    expect(history?.cached_tokens).toBe(80);
    expect(history?.cache_write_tokens).toBe(12);
    expect(history?.provider_requests).toEqual([
      {
        model: 'deepseek/deepseek-v4-flash-0731',
        messages: [{ role: 'user', content: 'Recommend a dispatch' }],
        max_tokens: 1000,
      },
    ]);
    expect(context.repositories.aiAudit.getHistoryTotals()).toMatchObject({
      request_count: 1,
      input_tokens: 120,
      output_tokens: 30,
      cached_tokens: 80,
      cost_usd: 0.00002,
    });
    expect(context.repositories.aiAudit.listDailyCosts()[0]).toMatchObject({
      date: '2026-08-15',
      request_count: 1,
      cost_usd: 0.00002,
    });
    const tool = context.db
      .prepare('SELECT status, duration_ms FROM ai_tool_calls WHERE ai_run_id = ?')
      .get('ai_run_test') as { status: string; duration_ms: number };
    expect(tool.status).toBe('succeeded');
    expect(tool.duration_ms).toBe(8);
  });
});
