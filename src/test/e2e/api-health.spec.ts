import { expect, test } from '@playwright/test';

test('health endpoint reports database and model configuration', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  const payload = await response.json() as { status: string; database: string; ai: { primaryModel: string; fallbackModel: string } };
  expect(payload.status).toBe('ok');
  expect(payload.database).toBe('ok');
  expect(payload.ai.primaryModel).toContain('deepseek');
  expect(payload.ai.fallbackModel).toContain('luna');
});
