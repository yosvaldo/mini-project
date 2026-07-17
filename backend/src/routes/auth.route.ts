import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import requestValidator from "../middlewares/request-validator.middleware.js";
import { uniqueUserGuard } from "../middlewares/auth.middleware.js";
import { signUpSchema, signInSchema } from "../validators/auth.validator.js";

const router = Router();

router.post(
    "/register", 
    requestValidator(signUpSchema), 
    uniqueUserGuard, 
    AuthController.signUp
);

router.post(
    "/login", 
    requestValidator(signInSchema), 
    AuthController.signIn
);

export default router;