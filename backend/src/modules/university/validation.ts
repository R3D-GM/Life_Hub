import { z } from "zod";

export const semesterSetupSchema = z.object({
  clientId: z.string().min(1),
  label: z.string().min(1),
  courseCount: z.number().int().min(1).max(20),
});

export const courseSchema = z.object({
  clientId: z.string().min(1),
  semesterId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().optional(),
  creditHours: z.number().int().positive().optional(),
});

export const taskSchema = z.object({
  clientId: z.string().min(1),
  courseId: z.string().uuid(),
  description: z.string().min(1),
  deadline: z.string().datetime().optional(),
  status: z.enum(["pending", "done"]).default("pending"),
});
