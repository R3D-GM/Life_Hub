import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { sleepSchema, waterSchema, movementSchema, nutritionSchema } from "./validation";
import * as svc from "./service";

const router = Router();
router.use(requireAuth);

// Sleep
router.get("/sleep", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entries: await svc.listSleep(req.userId as string) });
}));
router.post("/sleep", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = sleepSchema.parse(req.body);
  res.status(201).json({ entry: await svc.createSleepEntry(req.userId as string, data) });
}));
router.delete("/sleep/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entry: await svc.deleteSleep(req.userId as string, String(req.params.clientId)) });
}));

// Water
router.get("/water", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entries: await svc.listWater(req.userId as string) });
}));
router.post("/water", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = waterSchema.parse(req.body);
  res.status(201).json({ entry: await svc.createWater(req.userId as string, data) });
}));
router.delete("/water/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entry: await svc.deleteWater(req.userId as string, String(req.params.clientId)) });
}));

// Movement
router.get("/movement", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entries: await svc.listMovement(req.userId as string) });
}));
router.post("/movement", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = movementSchema.parse(req.body);
  res.status(201).json({ entry: await svc.createMovement(req.userId as string, data) });
}));
router.delete("/movement/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entry: await svc.deleteMovement(req.userId as string, String(req.params.clientId)) });
}));

// Nutrition
router.get("/nutrition", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entries: await svc.listNutrition(req.userId as string) });
}));
router.post("/nutrition", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = nutritionSchema.parse(req.body);
  res.status(201).json({ entry: await svc.createNutrition(req.userId as string, data) });
}));
router.delete("/nutrition/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ entry: await svc.deleteNutrition(req.userId as string, String(req.params.clientId)) });
}));

export default router;
