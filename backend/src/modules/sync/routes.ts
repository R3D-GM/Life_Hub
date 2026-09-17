import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { syncRequestSchema } from "./validation";
import { applySyncOps } from "./service";

const router = Router();
router.use(requireAuth);

// Each op is applied independently and idempotently (by clientId), so a
// partial failure in a batch doesn't block the rest, and retried ops that
// actually succeeded the first time just return the existing row.
router.post("/", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { ops } = syncRequestSchema.parse(req.body);
  const results = await applySyncOps(req.userId as string, ops);
  res.json({ results });
}));

export default router;
