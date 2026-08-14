import { z } from 'zod';

function booleanFromEnv(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    }
    return value;
  }, z.boolean());
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_PATH: z.string().min(1).default('./data/moon-courier.db'),
  DB_AUTO_MIGRATE: booleanFromEnv(true),
  DEMO_AUTO_SEED: booleanFromEnv(true),
  OPENROUTER_API_KEY: z.string().default(''),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  AI_ENABLED: booleanFromEnv(true),
  AI_PRIMARY_MODEL: z.string().min(1).default('deepseek/deepseek-v4-flash-0731'),
  AI_FALLBACK_MODEL: z.string().min(1).default('openai/gpt-5.6-luna'),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(25_000),
  AI_MAX_TOOL_TURNS: z.coerce.number().int().min(1).max(8).default(4),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(128).max(8_192).default(1_400),
  AI_DAILY_BUDGET_USD: z.coerce.number().min(0).max(100).default(3),
  AI_REASONING_ENABLED: booleanFromEnv(false),
  AI_PROVIDER_REQUIRE_PARAMETERS: booleanFromEnv(true),
  AI_DATA_COLLECTION: z.enum(['allow', 'deny']).default('deny'),
  AI_PRIMARY_INPUT_USD_PER_M: z.coerce.number().min(0).default(0.0798),
  AI_PRIMARY_OUTPUT_USD_PER_M: z.coerce.number().min(0).default(0.1596),
  AI_FALLBACK_INPUT_USD_PER_M: z.coerce.number().min(0).default(0.1),
  AI_FALLBACK_OUTPUT_USD_PER_M: z.coerce.number().min(0).default(0.6),
  OPENROUTER_SITE_URL: z.string().url().default('http://localhost:3000'),
  OPENROUTER_APP_NAME: z.string().min(1).default('Moon Courier Crisis'),
  API_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).max(1_000).default(30),
  ADMIN_TOKEN: z.string().min(1).default('change-me-for-public-deployment'),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (!cachedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) throw new Error(`Invalid environment: ${result.error.message}`);
    cachedEnv = result.data;
  }
  return cachedEnv;
}

export function resetEnvCacheForTests(): void {
  cachedEnv = undefined;
}
