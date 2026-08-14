import { z } from 'zod';

export const dispatchPreviewRequestSchema = z.object({
  missionId: z.string().min(1),
  orderId: z.string().min(1),
  roverId: z.string().min(1),
  objective: z.enum(['fastest', 'safest', 'efficient', 'balanced']).default('balanced'),
});

export const launchDeliveryRequestSchema = dispatchPreviewRequestSchema.extend({
  idempotencyKey: z.string().min(8).max(200),
});

export type DispatchPreviewRequest = z.infer<typeof dispatchPreviewRequestSchema>;
export type LaunchDeliveryRequest = z.infer<typeof launchDeliveryRequestSchema>;
