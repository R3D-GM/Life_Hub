import { z } from "zod";

export const skillSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1),
  progressPercent: z.number().int().min(0).max(100).default(0),
});

export const learningSessionSchema = z.object({
  clientId: z.string().min(1),
  skillId: z.string().uuid().optional(),
  topic: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  loggedAt: z.string().datetime(),
});
