import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/app.error.js";
import Cloudinary from "../libs/cloudinary.js";
import { Readable } from "stream";
import EmailService from "../services/email.service.js";
import renderTemplate from "../libs/handlebars.js";

class CloudinaryStorageController {
    private baseDir = "eventura";

    public uploadPaymentProof = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user || !req.user.email) throw new AppError("Authentication context missing", 401);
            if (!req.file) throw new AppError("No payment proof file uploaded", 400);

            const userEmail = req.user.email;

            const stream = Cloudinary.uploader.upload_stream(
                { folder: `${this.baseDir}/payment_proofs` },
                async (err, result) => {
                    if (err || !result) return next(new AppError("Payment proof upload failed", 500, err));

                    try {
                        const emailHtml = renderTemplate("payment-proof.email.hbs", {
                            fileUrl: result.secure_url,
                        });
                        EmailService.sendEmail(
                            userEmail,
                            "Payment Proof Received - Eventura",
                            emailHtml
                        ).catch((emailErr) => {
                            console.error("Background email send failed:", emailErr);
                        });
                    } catch (templateErr) {
                        console.error("Failed to render payment template:", templateErr);
                    }

                    res.status(200).send({
                        status: 200,
                        message: "Payment proof uploaded successfully! Confirmation email dispatched.",
                        data: { url: result.secure_url },
                    });
                }
            );

            Readable.from(req.file.buffer).pipe(stream);
        } catch (error) {
            next(error);
        }
    };

    public uploadEventImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) throw new AppError("Authentication context missing", 401);
            if (!req.file) throw new AppError("No event image file uploaded", 400);

            const stream = Cloudinary.uploader.upload_stream(
                { folder: `${this.baseDir}/events_images` },
                async (err, result) => {
                    if (err || !result) return next(new AppError("Event image upload failed", 500, err));

                    res.status(200).send({
                        status: 200,
                        message: "Event image uploaded successfully!",
                        data: { url: result.secure_url },
                    });
                }
            );

            Readable.from(req.file.buffer).pipe(stream);
        } catch (error) {
            next(error);
        }
    };
}

const cloudinaryStorageController = new CloudinaryStorageController();
export default cloudinaryStorageController;