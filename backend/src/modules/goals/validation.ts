import { z } from "zod";

export const goalSchema = z.object({
  clientId: z.string().min(1),
  category: z.enum(["career", "aiml", "university", "spiritual", "personal"]),
  name: z.string().min(1),
  progressPercent: z.number().int().min(0).max(100).default(0),
});

export const milestoneSchema = z.object({
  clientId: z.string().min(1),
  goalId: z.string().uuid(),
  name: z.string().min(1),
  completed: z.boolean().default(false),
  order: z.number().int().default(0),
});
