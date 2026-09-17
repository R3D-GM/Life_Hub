import { z } from "zod";

export const habitSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1),
  frequency: z.enum(["daily", "weekly"]),
});

export const habitCompletionSchema = z.object({
  clientId: z.string().min(1),
  habitId: z.string().uuid(),
  date: z.string().datetime(),
  completed: z.boolean().default(true),
});
