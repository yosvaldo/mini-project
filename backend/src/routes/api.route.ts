import express, { Router } from "express";
import { APP_NAME } from "../configs/env.config.js";
import authRoute from "./auth.route.js";
import eventRoute from "./event.route.js";
import dashboardRouter from "./dashboard.route.js";
import transactionRouter from "./transaction.route.js";
import cloudinaryStorageResource from "../resources/cloudinary-storage.resource.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const apiRouter: Router = express.Router();

apiRouter.get("/", (_, res) => res.send(`Welcome to the ${APP_NAME} API`));
apiRouter.use("/health", (_, res) => res.send("OK"));

apiRouter.use("/auth", authRoute);
apiRouter.use("/events", eventRoute);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/transactions", transactionRouter);
apiRouter.use("/storage", verifyToken("access"), cloudinaryStorageResource);

export default apiRouter;