import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { accountSchema, categorySchema, transactionSchema } from "./validation";
import * as svc from "./service";

const router = Router();
router.use(requireAuth);

router.get("/accounts", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ accounts: await svc.getAccountBalances(req.userId as string) });
}));
router.post("/accounts", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = accountSchema.parse(req.body);
  res.status(201).json({ account: await svc.createAccount(req.userId as string, data) });
}));
router.delete("/accounts/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ account: await svc.deleteAccount(req.userId as string, String(req.params.clientId)) });
}));

router.get("/categories", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ categories: await svc.listCategories(req.userId as string) });
}));
router.post("/categories", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = categorySchema.parse(req.body);
  res.status(201).json({ category: await svc.createCategory(req.userId as string, data) });
}));

router.get("/transactions", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ transactions: await svc.listTransactions(req.userId as string) });
}));
router.post("/transactions", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = transactionSchema.parse(req.body);
  res.status(201).json({ transaction: await svc.createTransaction(req.userId as string, data) });
}));
router.delete("/transactions/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ transaction: await svc.deleteTransaction(req.userId as string, String(req.params.clientId)) });
}));

export default router;
