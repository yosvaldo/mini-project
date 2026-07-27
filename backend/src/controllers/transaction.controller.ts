import type { Request, Response, NextFunction } from "express";
import transactionService from "../services/transaction.service.js";
import AppError from "../errors/app.error.js";
import { responseBuilder } from "../utils/response-builder.util.js";
import Cloudinary from "../libs/cloudinary.js";
import { Readable } from "stream";

class TransactionController {
  getPreview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError("Unauthorized", 401);

      const { eventId, quantity, useCouponId, usePoints } = req.query;

      if (!eventId) throw new AppError("Event ID is required", 400);

      const qty = Math.max(1, parseInt(String(quantity || "1"), 10));
      const isUsePoints = String(usePoints) === "true";
      const couponId = useCouponId ? String(useCouponId).trim() : null;

      const preview = await transactionService.calculateCheckoutPreview(
        userId,
        String(eventId),
        qty,
        couponId,
        isUsePoints
      );

      return res.status(200).send(
        responseBuilder(200, "Preview calculated successfully", {
          basePrice: preview.basePrice,
          discount: preview.discount,
          finalPrice: preview.finalPrice,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  purchaseTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError("Unauthorized", 401);

      const { eventId, quantity, useCouponId, usePoints } = req.body;
      const file = req.file;

      if (!eventId) throw new AppError("Event ID is required", 400);
      if (!file) throw new AppError("Payment proof image is required", 400);

      const qty = Math.max(1, parseInt(String(quantity || "1"), 10));
      const isUsePoints = String(usePoints) === "true";
      const couponId = useCouponId ? String(useCouponId).trim() : null;

      const uploadToCloudinary = (): Promise<string> => {
        return new Promise((resolve, reject) => {
          const stream = Cloudinary.uploader.upload_stream(
            { folder: "eventura_file_handling/payment_proofs" },
            (err, result) => {
              if (err || !result) {
                return reject(new AppError("Failed to upload payment proof to Cloudinary", 500));
              }
              resolve(result.secure_url);
            }
          );
          Readable.from(file.buffer).pipe(stream);
        });
      };

      const paymentProofUrl = await uploadToCloudinary();

      const transaction = await transactionService.processTicketPurchase(
        userId,
        {
          eventId: String(eventId),
          quantity: qty,
          useCouponId: couponId,
          usePoints: isUsePoints,
        },
        paymentProofUrl
      );

      return res.status(201).send(
        responseBuilder(201, "Ticket purchase submitted successfully", transaction)
      );
    } catch (error) {
      next(error);
    }
  };
}

export default new TransactionController();