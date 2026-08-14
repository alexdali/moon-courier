import { getEnv } from '@/config/env';

export interface FeatureFlags {
  aiEnabled: boolean;
  scenarioGeneration: boolean;
  analyticsAgent: boolean;
  localModelImplemented: false;
}

export function getFeatureFlags(): FeatureFlags {
  const env = getEnv();
  const aiEnabled = env.AI_ENABLED && env.OPENROUTER_API_KEY.length > 0;
  return {
    aiEnabled,
    scenarioGeneration: aiEnabled,
    analyticsAgent: aiEnabled,
    localModelImplemented: false,
  };
}
