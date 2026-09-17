import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { semesterSetupSchema, courseSchema, taskSchema } from "./validation";
import * as svc from "./service";

const router = Router();
router.use(requireAuth);

router.get("/semesters", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ semesters: await svc.listSemesters(req.userId as string) });
}));
router.post("/semesters/setup", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = semesterSetupSchema.parse(req.body);
  res.status(201).json(await svc.setupSemester(req.userId as string, data));
}));

router.get("/semesters/:semesterId/courses", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ courses: await svc.listCoursesForSemester(req.userId as string, String(req.params.semesterId)) });
}));
router.patch("/courses/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ course: await svc.updateCourse(req.userId as string, String(req.params.clientId), req.body) });
}));

router.post("/tasks", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = taskSchema.parse(req.body);
  res.status(201).json({ task: await svc.createTask(req.userId as string, data) });
}));
router.patch("/tasks/:clientId", asyncHandler(async (req: AuthedRequest, res: Response) => {
  const status = String(req.body.status);
  res.json({ task: await svc.updateTaskStatus(req.userId as string, String(req.params.clientId), status) });
}));
router.get("/tasks/upcoming", asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ tasks: await svc.listUpcomingTasks(req.userId as string) });
}));

export default router;
