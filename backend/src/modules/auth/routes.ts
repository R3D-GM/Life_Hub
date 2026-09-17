import { Router, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { registerSchema, loginSchema } from "./validation";
import { registerUser, loginUser, signToken, getUserById } from "./service";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false, // set true once served over HTTPS
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

router.post(
  "/register",
  asyncHandler(async (req, res: Response) => {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data.email, data.password, data.name);
    const token = signToken(user.id);
    res.cookie("lifehub_token", token, COOKIE_OPTIONS);
    res.status(201).json({ user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res: Response) => {
    const data = loginSchema.parse(req.body);
    const user = await loginUser(data.email, data.password);
    const token = signToken(user.id);
    res.cookie("lifehub_token", token, COOKIE_OPTIONS);
    res.json({ user });
  })
);

router.post("/logout", (req, res: Response) => {
  res.clearCookie("lifehub_token");
  res.json({ ok: true });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const user = await getUserById(req.userId as string);
    res.json({ user });
  })
);

export default router;
