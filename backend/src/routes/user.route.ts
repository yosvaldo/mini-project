import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { roleGuard, verifyToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get(
	"/",
	verifyToken("access"),
	roleGuard("ORGANIZER"),
	UserController.getAll,
);

export default userRouter;