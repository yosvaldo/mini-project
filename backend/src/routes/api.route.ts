import express, { Router } from "express";
import { APP_NAME } from "../configs/env.config.js";
import authRoute from "./auth.route.js"; 

const apiRouter: Router = express.Router();

apiRouter.get("/", (_, res) => res.send(`Welcome to the ${APP_NAME} API`));

apiRouter.use("/auth", authRoute);
apiRouter.use("/health", (_, res) => res.send("OK"));

export default apiRouter;