import { AiOutputError } from '@/modules/ai/openrouter/errors';

export function parseJsonContent<T>(content: string | null): T {
  if (!content) throw new AiOutputError('Model returned empty content');
  const trimmed = content.trim();
  const withoutFence = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    : trimmed;
  try { return JSON.parse(withoutFence) as T; }
  catch (error) { throw new AiOutputError('Model returned invalid JSON', { content: content.slice(0, 1_000), error }); }
}
