import express, { Router } from "express";
import { APP_NAME } from "../configs/env.config.js";
import authRoute from "./auth.route.js"; 
import transactionController from "../controllers/transaction.controller.js";
import cloudinaryStorageResource from "../resources/cloudinary-storage.resource.js";

import multer from "multer";
const upload = multer({ limits: { fileSize: 3 * 1024 * 1024 } });

const apiRouter: Router = express.Router();

apiRouter.get("/", (_, res) => res.send(`Welcome to the ${APP_NAME} API`));
apiRouter.use("/health", (_, res) => res.send("OK"));

apiRouter.use("/auth", authRoute);
apiRouter.use("/storage", cloudinaryStorageResource);

apiRouter.get("/transactions/preview", transactionController.checkoutPreview);
apiRouter.post("/transactions/purchase", upload.single("paymentProof"), transactionController.submitPurchase);

export default apiRouter;