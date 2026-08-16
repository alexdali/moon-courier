import type { AppEnv } from '@/config/env';
import type { OpenRouterMessage, OpenRouterRequest, OpenRouterToolDefinition } from '@/modules/ai/openrouter/types';

export function buildOpenRouterRequest(input: {
  env: AppEnv;
  model: string;
  messages: readonly OpenRouterMessage[];
  tools?: readonly OpenRouterToolDefinition[];
  responseFormat?: Record<string, unknown>;
}): OpenRouterRequest {
  return {
    model: input.model,
    messages: input.messages,
    ...(input.tools ? { tools: input.tools, tool_choice: 'auto' as const } : {}),
    ...(input.responseFormat ? { response_format: input.responseFormat } : {}),
    // This is the common parameter set of the configured DeepSeek and Luna
    // routes. With require_parameters enabled, any unsupported optional field
    // makes OpenRouter reject all providers before inference starts.
    max_tokens: input.env.AI_MAX_OUTPUT_TOKENS,
    ...(input.env.AI_REASONING_ENABLED ? { reasoning: { enabled: true, effort: 'high' as const } } : {}),
    provider: {
      require_parameters: input.env.AI_PROVIDER_REQUIRE_PARAMETERS,
      data_collection: input.env.AI_DATA_COLLECTION,
    },
  };
}
