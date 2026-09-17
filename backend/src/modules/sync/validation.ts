import { z } from "zod";

export const syncOpSchema = z.object({
  entityType: z.enum([
    "sleep", "water", "movement", "nutrition",
    "account", "transaction",
    "habit", "habitCompletion",
    "goal", "goalMilestone",
    "skill", "learningSession",
    "courseTask",
  ]),
  operation: z.enum(["create", "update", "delete"]),
  clientId: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const syncRequestSchema = z.object({
  ops: z.array(syncOpSchema).min(1).max(100),
});
