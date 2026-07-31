import type { NextFunction, Request, Response } from "express";
import { responseBuilder } from "../utils/response-builder.util.js";
import AppError from "../errors/app.error.js";
import cookieConfig from "../configs/cookie.config.js";
import authService from "../services/auth.service.js";
import { hashPassword } from "../libs/bcrypt.js";
import { signUpSchema } from "../validators/auth.validator.js";
import { prisma } from "../libs/prisma.client.js";

class AuthController {
    signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedData = await signUpSchema.parseAsync(req.body);
            
            const rawReferralInput = 
                parsedData.referredByCode || 
                parsedData.referralCode || 
                parsedData.referredBy || 
                req.body.referredByCode || 
                req.body.referralCode || 
                req.body.referredBy || 
                "";

            const { fullName, email, password, role } = parsedData;

            const hashedPassword = await hashPassword(password);
            const generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 3);

            const normalizedReferralCode = typeof rawReferralInput === "string" 
                ? rawReferralInput.trim().toUpperCase() 
                : "";

            await prisma.$transaction(async (tx) => {
                let referrerUser = null;

                if (normalizedReferralCode.length > 0) {
                    referrerUser = await tx.user.findFirst({
                        where: {
                            referralCode: {
                                equals: normalizedReferralCode,
                                mode: "insensitive"
                            }
                        }
                    });

                    if (!referrerUser) {
                        throw new AppError("Invalid or non-existent referral code", 400);
                    }
                }

                const newUser = await tx.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        role,
                        fullName: fullName || email.split("@")[0], 
                        referralCode: generatedReferralCode,
                        referredById: referrerUser ? referrerUser.id : null
                    }
                });

                if (referrerUser) {
                    await tx.point.create({
                        data: {
                            userId: referrerUser.id,
                            amount: 10000,
                            expiresAt: expirationDate
                        }
                    });

                    await tx.coupon.create({
                        data: {
                            userId: newUser.id,
                            discountPct: 10,
                            expiresAt: expirationDate
                        }
                    });
                }
            });

            return res
                .status(201)
                .send(responseBuilder(201, "User registered successfully", null));
        } catch (error) {
            next(error);
        }
    };

    signIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await authService.signIn(email, password);
            return res.cookie("refresh-token", refreshToken, cookieConfig).send(
                responseBuilder(200, "Login successful", { user, accessToken })
            );
        } catch (error) { next(error); }
    };

    signOut = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("User not authenticated", 401);
            res.clearCookie("refresh-token", cookieConfig);
            return res.send(responseBuilder(200, "Logout successful", null));
        } catch (error) { next(error); }
    };

    getAuthUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("User not authenticated", 401);
            
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    points: {
                        where: { isUsed: false, expiresAt: { gte: new Date() } },
                        orderBy: { expiresAt: "asc" }
                    },
                    coupons: {
                        where: { isUsed: false, expiresAt: { gte: new Date() } },
                        orderBy: { expiresAt: "asc" }
                    },
                    transactions: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    name: true,
                                    date: true,
                                    location: true
                                }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }
                }
            });

            if (!user) throw new AppError("User profile not found", 404);

            const totalPoints = user.points?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

            const userPayload = {
                ...user,
                password: null,
                totalPoints,
                activeCouponsCount: user.coupons?.length || 0
            };

            return res.send(responseBuilder(200, "Success", userPayload));
        } catch (error) { next(error); }
    };
}

export default new AuthController();