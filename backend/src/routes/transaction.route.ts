import { Router } from "express";
import TransactionController from "../controllers/transaction.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({
  limits: { fileSize: 3 * 1024 * 1024 }, 
});

const transactionRouter = Router();

transactionRouter.use(verifyToken("access"));

transactionRouter.get("/preview", TransactionController.getPreview);

transactionRouter.post(
  "/purchase",
  upload.single("paymentProof"),
  TransactionController.purchaseTicket
);

export default transactionRouter;