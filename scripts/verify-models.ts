import { getAiModelConfigs } from '@/config/ai-models';
import { getEnv } from '@/config/env';
import { OpenRouterClient } from '@/modules/ai/openrouter/client';

const env = getEnv();
if (!env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is required for live model verification');
const response = await new OpenRouterClient(env).listModels() as { data?: readonly { id?: string; supported_parameters?: readonly string[] }[] };
const models = new Map((response.data ?? []).map((item) => [item.id, item]));
let failed = false;
for (const config of getAiModelConfigs(env)) {
  const model = models.get(config.model);
  const parameters = new Set(model?.supported_parameters ?? []);
  const missing = ['tools', 'response_format'].filter((parameter) => !parameters.has(parameter));
  console.log(`${config.role.padEnd(8)} ${config.model}: ${model ? 'available' : 'NOT FOUND'}${missing.length ? `; verify endpoint support for ${missing.join(', ')}` : ''}`);
  if (!model) failed = true;
}
if (failed) process.exitCode = 1;
