import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { habitSchema, habitCompletionSchema } from "./validation";
import * as svc from "./service";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ habits: await svc.listHabitsWithStreaks(req.userId as string) });
}));
router.post("/", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = habitSchema.parse(req.body);
  res.status(201).json({ habit: await svc.createHabit(req.userId as string, data) });
}));
router.delete("/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ habit: await svc.deleteHabit(req.userId as string, String(req.params.clientId)) });
}));
router.post("/complete", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = habitCompletionSchema.parse(req.body);
  res.status(201).json({ completion: await svc.completeHabit(req.userId as string, data) });
}));

export default router;
