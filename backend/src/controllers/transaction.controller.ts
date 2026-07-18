import type { NextFunction, Request, Response } from "express";
import { responseBuilder } from "../utils/response-builder.util.js";
import AppError from "../errors/app.error.js";
import transactionService from "../services/transaction.service.js";
import { PurchaseTicketSchema } from "../validators/auth.validator.js";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary"; 

class TransactionController {
    checkoutPreview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("Authentication target context missing", 401);
            const userId = (req.user as any).id;
            
            const payload = {
                eventId: req.query.eventId as string,
                quantity: Number(req.query.quantity),
                useCouponId: req.query.useCouponId as string || null,
                usePoints: req.query.usePoints === "true"
            };

            const parsed = await PurchaseTicketSchema.parseAsync(payload);
            const preview = await transactionService.calculateCheckoutPreview(
                userId, parsed.eventId, parsed.quantity, parsed.useCouponId, parsed.usePoints
            );

            return res.send(responseBuilder(200, "Checkout calculation complete", {
                basePrice: preview.basePrice,
                discount: preview.discount,
                finalPrice: preview.finalPrice
            }));
        } catch (error: any) { next(error); }
    };

    submitPurchase = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("Authentication target context missing", 401);
            
            const extendedReq = req as Request & { file?: any };
            if (!extendedReq.file) throw new AppError("Payment transaction proof file record must be uploaded", 400);

            const userId = (extendedReq.user as any).id;

            const bodyPayload = {
                eventId: extendedReq.body.eventId,
                quantity: Number(extendedReq.body.quantity),
                useCouponId: extendedReq.body.useCouponId || null,
                usePoints: extendedReq.body.usePoints === "true" || extendedReq.body.usePoints === true
            };

            const validatedFields = await PurchaseTicketSchema.parseAsync(bodyPayload);

            const stream = cloudinary.uploader.upload_stream(
                { folder: "eventura/payment_proofs" },
                async (err: any, result: any) => {
                    if (err || !result) return next(new AppError("Cloudinary media stream save operation failed", 500, err));

                    try {
                        const transaction = await transactionService.processTicketPurchase(
                            userId, validatedFields, result.secure_url
                        );
                        return res.status(201).send(responseBuilder(201, "Ticket order processed successfully", transaction));
                    } catch (transactionError) {
                        return next(transactionError);
                    }
                }
            );

            Readable.from(extendedReq.file.buffer).pipe(stream);
        } catch (error: any) { next(error); }
    };
}

export default new TransactionController();