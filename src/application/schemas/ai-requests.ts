import { z } from 'zod';

export const missionControlRequestSchema = z.object({
  missionId: z.string().min(1),
  message: z.string().trim().min(2).max(2_000),
  selectedOrderId: z.string().min(1).optional(),
  selectedRoverId: z.string().min(1).optional(),
});

export const generateScenarioRequestSchema = z.object({
  prompt: z.string().trim().min(10).max(4_000),
  seed: z.number().int().min(1).max(2_147_483_647).optional(),
  difficulty: z.enum(['easy', 'normal', 'hard', 'crisis']).optional(),
  durationDays: z.number().int().min(1).max(30).optional(),
});

export type MissionControlRequest = z.infer<typeof missionControlRequestSchema>;
export type GenerateScenarioRequest = z.infer<typeof generateScenarioRequestSchema>;
