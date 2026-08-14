import { describe, expect, it } from 'vitest';
import { parseJsonContent } from '@/modules/ai/openrouter/response-parser';

describe('OpenRouter response parser', () => {
  it('parses plain and fenced JSON', () => {
    expect(parseJsonContent<{ ok: boolean }>(' {"ok":true} ')).toEqual({ ok: true });
    expect(parseJsonContent<{ ok: boolean }>('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });
  it('rejects invalid JSON', () => expect(() => parseJsonContent('{oops')).toThrow(/invalid JSON/i));
});
