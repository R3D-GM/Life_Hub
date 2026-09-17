import { z } from "zod";

export const sleepSchema = z.object({
  clientId: z.string().min(1),
  bedtime: z.string().datetime(),
  wakeTime: z.string().datetime(),
  quality: z.number().int().min(1).max(5).optional(),
  feeling: z.string().optional(),
  date: z.string().datetime(),
});

export const waterSchema = z.object({
  clientId: z.string().min(1),
  amountMl: z.number().int().positive(),
  loggedAt: z.string().datetime(),
});

export const movementSchema = z.object({
  clientId: z.string().min(1),
  activityType: z.enum(["walking", "running", "jump_rope"]),
  durationMinutes: z.number().int().positive(),
  loggedAt: z.string().datetime(),
});

export const nutritionSchema = z.object({
  clientId: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  description: z.string().min(1),
  loggedAt: z.string().datetime(),
});
