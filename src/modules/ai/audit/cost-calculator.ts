import type { AiModelConfig } from '@/config/ai-models';

export function estimateTokenCost(inputTokens: number, outputTokens: number, model: AiModelConfig): number {
  return (inputTokens / 1_000_000) * model.inputUsdPerMillion + (outputTokens / 1_000_000) * model.outputUsdPerMillion;
}
