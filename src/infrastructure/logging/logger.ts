import pino from 'pino';
import { getEnv } from '@/config/env';

const env = getEnv();

export const logger = pino({
  name: 'moon-courier-crisis',
  level: env.LOG_LEVEL,
  redact: {
    paths: ['OPENROUTER_API_KEY', 'req.headers.authorization', '*.apiKey', '*.token'],
    censor: '[REDACTED]',
  },
});
