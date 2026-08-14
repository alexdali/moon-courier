import { describe, expect, it } from 'vitest';
import { ModelRouter } from '@/modules/ai/routing/model-router';
import { FakeClock } from '@/test/helpers/fake-clock';
import { FakeIdGenerator } from '@/test/helpers/fake-id-generator';
import type { AiAuditRepository } from '@/application/ports/ai-audit-repository';
import type { AppEnv } from '@/config/env';

function fakeEnv(): AppEnv {
  return {
    NODE_ENV: 'test', APP_URL: 'http://localhost:3000', LOG_LEVEL: 'silent', DATABASE_PATH: ':memory:', DB_AUTO_MIGRATE: true, DEMO_AUTO_SEED: true,
    OPENROUTER_API_KEY: 'test', OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1', AI_ENABLED: true,
    AI_PRIMARY_MODEL: 'deepseek/deepseek-v4-flash-0731', AI_FALLBACK_MODEL: 'openai/gpt-5.6-luna', AI_REQUEST_TIMEOUT_MS: 1000,
    AI_MAX_TOOL_TURNS: 4, AI_MAX_OUTPUT_TOKENS: 1000, AI_DAILY_BUDGET_USD: 3, AI_REASONING_ENABLED: false,
    AI_PROVIDER_REQUIRE_PARAMETERS: true, AI_DATA_COLLECTION: 'deny', AI_PRIMARY_INPUT_USD_PER_M: .0798,
    AI_PRIMARY_OUTPUT_USD_PER_M: .1596, AI_FALLBACK_INPUT_USD_PER_M: .1, AI_FALLBACK_OUTPUT_USD_PER_M: .6,
    OPENROUTER_SITE_URL: 'http://localhost:3000', OPENROUTER_APP_NAME: 'Test', API_RATE_LIMIT_PER_MINUTE: 30, ADMIN_TOKEN: 'test',
  };
}

describe('model router', () => {
  it('uses Luna after the DeepSeek attempt fails and audits both attempts', async () => {
    const starts: string[] = []; const finishes: string[] = [];
    const audit: AiAuditRepository = {
      startRun: (run) => starts.push(run.model),
      finishRun: (_id, finish) => finishes.push(finish.status),
      recordToolCall: () => undefined,
      sumCostSince: () => 0,
      listRecent: () => [],
    };
    const router = new ModelRouter(fakeEnv(), audit, new FakeClock(), new FakeIdGenerator());
    const result = await router.execute({
      requestType: 'test', promptVersion: 'v1', request: {},
      attempt: async (model) => {
        if (model.role === 'primary') throw new Error('primary provider failed');
        return { value: 'ok', inputTokens: 10, outputTokens: 4, costUsd: 0, latencyMs: 12, response: {} };
      },
    });
    expect(result.value).toBe('ok');
    expect(result.fallbackUsed).toBe(true);
    expect(starts).toEqual(['deepseek/deepseek-v4-flash-0731', 'openai/gpt-5.6-luna']);
    expect(finishes).toEqual(['failed', 'succeeded']);
  });
});
