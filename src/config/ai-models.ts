import type { AppEnv } from '@/config/env';

export type AiModelRole = 'primary' | 'fallback';

export interface AiModelConfig {
  role: AiModelRole;
  model: string;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
}

export function getAiModelConfigs(env: AppEnv): readonly AiModelConfig[] {
  return [
    {
      role: 'primary',
      model: env.AI_PRIMARY_MODEL,
      inputUsdPerMillion: env.AI_PRIMARY_INPUT_USD_PER_M,
      outputUsdPerMillion: env.AI_PRIMARY_OUTPUT_USD_PER_M,
    },
    {
      role: 'fallback',
      model: env.AI_FALLBACK_MODEL,
      inputUsdPerMillion: env.AI_FALLBACK_INPUT_USD_PER_M,
      outputUsdPerMillion: env.AI_FALLBACK_OUTPUT_USD_PER_M,
    },
  ];
}
