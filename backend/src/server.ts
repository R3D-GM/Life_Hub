import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler, asyncHandler } from "./middleware/errorHandler";

import authRoutes from "./modules/auth/routes";
import healthRoutes from "./modules/health/routes";
import financeRoutes from "./modules/finance/routes";
import habitsRoutes from "./modules/habits/routes";
import goalsRoutes from "./modules/goals/routes";
import learningRoutes from "./modules/learning/routes";
import universityRoutes from "./modules/university/routes";
import syncRoutes from "./modules/sync/routes";
import { requireAuth, AuthedRequest } from "./middleware/auth";
import { getDashboard } from "./modules/dashboard/service";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health-check", (req, res) => {
  res.json({ status: "ok", message: "LifeHub backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/sync", syncRoutes);

app.get(
  "/api/dashboard",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await getDashboard(req.userId as string));
  })
);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`LifeHub backend listening on http://localhost:${PORT}`);
});
