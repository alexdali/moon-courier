import { describe, expect, it } from 'vitest';
import type { AppEnv } from '@/config/env';
import { buildOpenRouterRequest } from '@/modules/ai/openrouter/request-builder';

describe('OpenRouter request builder', () => {
  it('uses only parameters supported by both configured routing models', () => {
    const request = buildOpenRouterRequest({
      env: {
        AI_MAX_OUTPUT_TOKENS: 1400,
        AI_REASONING_ENABLED: false,
        AI_PROVIDER_REQUIRE_PARAMETERS: true,
        AI_DATA_COLLECTION: 'deny',
      } as AppEnv,
      model: 'deepseek/deepseek-v4-flash-0731',
      messages: [{ role: 'user', content: 'Recommend a dispatch.' }],
      tools: [{
        type: 'function',
        function: { name: 'recommend_dispatch', description: 'Recommend', parameters: { type: 'object' } },
      }],
    });

    expect(request).toMatchObject({
      max_tokens: 1400,
      tool_choice: 'auto',
      provider: { require_parameters: true, data_collection: 'deny' },
    });
    expect(request).not.toHaveProperty('max_completion_tokens');
    expect(request).not.toHaveProperty('parallel_tool_calls');
    expect(request).not.toHaveProperty('temperature');
  });
});
