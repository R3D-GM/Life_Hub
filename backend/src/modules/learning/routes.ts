import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { skillSchema, learningSessionSchema } from "./validation";
import * as svc from "./service";

const router = Router();
router.use(requireAuth);

router.get("/skills", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ skills: await svc.listSkills(req.userId as string) });
}));
router.post("/skills", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = skillSchema.parse(req.body);
  res.status(201).json({ skill: await svc.createSkill(req.userId as string, data) });
}));
router.patch("/skills/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const progressPercent = Number(req.body.progressPercent);
  res.json({ skill: await svc.updateSkillProgress(req.userId as string, String(req.params.clientId), progressPercent) });
}));

router.get("/sessions", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ sessions: await svc.listLearningSessions(req.userId as string) });
}));
router.post("/sessions", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = learningSessionSchema.parse(req.body);
  res.status(201).json({ session: await svc.createLearningSession(req.userId as string, data) });
}));

export default router;
