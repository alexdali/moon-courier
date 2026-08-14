import { z } from 'zod';

export const assistantFinalAnswerSchema = z.object({
  answer: z.string().min(1).max(2_500),
  suggestedSelection: z.object({ orderId: z.string(), roverId: z.string() }).optional(),
});
