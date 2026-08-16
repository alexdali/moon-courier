import type { AppEnv } from '@/config/env';
import type {
  OpenRouterCompletion,
  OpenRouterRequest,
  OpenRouterResponse,
} from '@/modules/ai/openrouter/types';
import { AiProviderError } from '@/modules/ai/openrouter/errors';

export class OpenRouterClient {
  constructor(private readonly env: AppEnv) {}

  async complete(request: OpenRouterRequest): Promise<OpenRouterCompletion> {
    if (!this.env.OPENROUTER_API_KEY)
      throw new AiProviderError('OPENROUTER_API_KEY is not configured', 'AI_NOT_CONFIGURED');
    const started = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.env.AI_REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${this.env.OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.env.OPENROUTER_SITE_URL,
          'X-OpenRouter-Title': this.env.OPENROUTER_APP_NAME,
        },
        body: JSON.stringify(request),
      });
      const raw = await response.text();
      let payload: OpenRouterResponse;
      try {
        payload = JSON.parse(raw) as OpenRouterResponse;
      } catch {
        throw new AiProviderError(
          'OpenRouter returned non-JSON content',
          'INVALID_PROVIDER_RESPONSE',
          response.status,
          raw.slice(0, 500),
        );
      }
      if (!response.ok || payload.error) {
        throw new AiProviderError(
          payload.error?.message ?? `OpenRouter request failed with ${response.status}`,
          String(payload.error?.code ?? 'OPENROUTER_HTTP_ERROR'),
          response.status,
          payload.error?.metadata,
        );
      }
      const message = payload.choices[0]?.message;
      if (!message)
        throw new AiProviderError(
          'OpenRouter response has no message',
          'EMPTY_PROVIDER_RESPONSE',
          response.status,
          payload,
        );
      return {
        response: payload,
        message,
        usage: {
          prompt_tokens: Number(payload.usage?.prompt_tokens ?? 0),
          completion_tokens: Number(payload.usage?.completion_tokens ?? 0),
          cached_tokens: Number(payload.usage?.prompt_tokens_details?.cached_tokens ?? 0),
          cache_write_tokens: Number(payload.usage?.prompt_tokens_details?.cache_write_tokens ?? 0),
          cost: Number(
            payload.usage?.cost ?? payload.usage?.cost_details?.upstream_inference_cost ?? 0,
          ),
        },
        latencyMs: Math.round(performance.now() - started),
      };
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AiProviderError('AI request timed out', 'AI_TIMEOUT', 504);
      }
      throw new AiProviderError(
        error instanceof Error ? error.message : 'Unknown AI transport error',
        'AI_TRANSPORT_ERROR',
        undefined,
        error,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async listModels(): Promise<unknown> {
    if (!this.env.OPENROUTER_API_KEY)
      throw new AiProviderError('OPENROUTER_API_KEY is not configured', 'AI_NOT_CONFIGURED');
    const response = await fetch(`${this.env.OPENROUTER_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${this.env.OPENROUTER_API_KEY}` },
    });
    if (!response.ok)
      throw new AiProviderError(
        `Model list failed: ${response.status}`,
        'MODEL_LIST_FAILED',
        response.status,
      );
    return response.json();
  }
}
