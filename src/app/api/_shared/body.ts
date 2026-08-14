import type { ZodType } from 'zod';

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const payload = await request.json();
  return schema.parse(payload);
}
