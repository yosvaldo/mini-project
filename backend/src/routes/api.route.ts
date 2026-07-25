import express, { Router } from "express";
import { APP_NAME } from "../configs/env.config.js";
import authRoute from "./auth.route.js";
import eventRoute from "./event.route.js";
import transactionController from "../controllers/transaction.controller.js";
import cloudinaryStorageResource from "../resources/cloudinary-storage.resource.js";
import { imageUploader } from "../middlewares/uploader.middleware.js";

const apiRouter: Router = express.Router();

apiRouter.get("/", (_, res) => res.send(`Welcome to the ${APP_NAME} API`));
apiRouter.use("/health", (_, res) => res.send("OK"));

apiRouter.use("/auth", authRoute);
apiRouter.use("/events", eventRoute);
apiRouter.use("/storage", cloudinaryStorageResource);

apiRouter.get("/transactions/preview", transactionController.checkoutPreview);
apiRouter.post("/transactions/purchase", imageUploader(3).single("paymentProof"), transactionController.submitPurchase);

export default apiRouter;