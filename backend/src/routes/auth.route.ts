import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/sign-up", AuthController.signUp);
authRouter.post("/sign-in", AuthController.signIn);
authRouter.post("/google/callback", AuthController.googleLogin);

authRouter.post(
    "/refresh-token",
    verifyToken("refresh"),
    AuthController.refreshToken
);

authRouter.use(verifyToken("access"));
authRouter.post("/sign-out", AuthController.signOut);
authRouter.get("/me", AuthController.getAuthUser);

export default authRouter;