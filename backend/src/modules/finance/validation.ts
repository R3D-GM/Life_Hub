import { z } from "zod";

export const accountSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["cash", "bank", "mobileMoney", "other"]),
});

export const categorySchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1),
});

export const transactionSchema = z.object({
  clientId: z.string().min(1),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive(),
  currency: z.string().default("ETB"),
  note: z.string().optional(),
  date: z.string().datetime(),
  transferToAccountId: z.string().uuid().optional(),
}).refine(
  (data) => (data.type === "transfer" ? !!data.transferToAccountId : true),
  { message: "transferToAccountId is required for transfer transactions", path: ["transferToAccountId"] }
);
