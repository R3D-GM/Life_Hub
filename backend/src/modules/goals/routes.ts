import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { goalSchema, milestoneSchema } from "./validation";
import * as svc from "./service";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ goals: await svc.listGoalsWithMilestones(req.userId as string) });
}));
router.post("/", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = goalSchema.parse(req.body);
  res.status(201).json({ goal: await svc.createGoal(req.userId as string, data) });
}));
router.delete("/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ goal: await svc.deleteGoal(req.userId as string, String(req.params.clientId)) });
}));
router.post("/milestones", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = milestoneSchema.parse(req.body);
  res.status(201).json({ milestone: await svc.createMilestone(req.userId as string, data) });
}));
router.patch("/milestones/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const completed = Boolean(req.body.completed);
  res.json({ milestone: await svc.toggleMilestone(req.userId as string, String(req.params.clientId), completed) });
}));

export default router;
