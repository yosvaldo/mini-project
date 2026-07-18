import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/app.error.js";
import Cloudinary from "../libs/cloudinary.js";
import { Readable } from "stream";
import EmailService from "../services/email.service.js";
import renderTemplate from "../libs/handlebars.js";

class CloudinaryStorageController {
    private baseDir = "eventura_file_handling";

    uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.email) throw new AppError("Authentication context missing", 401);
            if (!req.file) throw new AppError("No avatar file uploaded", 400);

            const stream = Cloudinary.uploader.upload_stream(
                { folder: `${this.baseDir}/avatars` },
                async (err, result) => {
                    if (err || !result) return next(new AppError("Avatar upload failed", 500, err));

                    return res.status(200).send({
                        status: 200,
                        message: "Avatar uploaded successfully!",
                        data: { url: result.secure_url },
                    });
                }
            );

            Readable.from(req.file.buffer).pipe(stream);
        } catch (error) {
            next(error);
        }
    };

    uploadPaymentProof = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.email) throw new AppError("Authentication context missing", 401);
            if (!req.file) throw new AppError("No payment proof file uploaded", 400);

            const userEmail = req.user.email;

            const stream = Cloudinary.uploader.upload_stream(
                { folder: `${this.baseDir}/payment_proofs` },
                async (err, result) => {
                    if (err || !result) return next(new AppError("Payment proof upload failed", 500, err));

                    EmailService.sendEmail(
                        userEmail,
                        "Payment Proof Received - Eventura",
                        renderTemplate("payment-success.email.hbs", {
                            fileUrl: result.secure_url,
                        }),
                    );

                    return res.status(200).send({
                        status: 200,
                        message: "Payment proof uploaded successfully! Confirmation email sent.",
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

export default new CloudinaryStorageController();