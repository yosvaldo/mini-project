import type { NextFunction, Request, Response } from "express";
import { responseBuilder } from "../utils/response-builder.util.js";
import AppError from "../errors/app.error.js";
import cookieConfig from "../configs/cookie.config.js";
import type { User } from "../generated/prisma/client.js";
import authService from "../services/auth.service.js";
import userRepo from "../repositories/user.repository.js";
import * as bcrypt from "../libs/bcrypt.js";

class AuthController {
    signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, role, referredByCode } = req.body;

            const bcryptModule = bcrypt as any;
            const genSaltFn = bcryptModule.genSalt || bcryptModule.default?.genSalt;
            const hashFn = bcryptModule.hash || bcryptModule.default?.hash;

            if (!genSaltFn || !hashFn) {
                throw new AppError("Bcrypt hashing utility methods missing", 500);
            }

            const salt = await genSaltFn(12);
            const hashedPassword = await hashFn(password, salt);
            const generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            await userRepo.create({ 
                email, 
                password: hashedPassword, 
                role,
                fullName: email.split("@")[0],
                referralCode: generatedReferralCode,
                ...(referredByCode && { referredByCode })
            });

            return res
                .status(201)
                .send(responseBuilder(201, "User registered successfully", null));
        } catch (error: Error | any) {
            next(error);
        }
    };

    signIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const { accessToken, refreshToken } = await authService.signIn(
                email,
                password,
            );

            return res.cookie("refresh-token", refreshToken, cookieConfig).send(
                responseBuilder(200, "Login successful", {
                    accessToken,
                }),
            );
        } catch (error: Error | any) {
            next(error);
        }
    };

    googleLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idToken } = req.body;

            if (!idToken) throw new AppError("Google ID token missing", 400);

            const { user, accessToken, refreshToken } =
                await authService.googleSignIn(idToken);

            if (user) (user as any).password = null;

            return res.cookie("refresh-token", refreshToken, cookieConfig).send(
                responseBuilder(200, "Login successful", {
                    user,
                    accessToken,
                }),
            );
        } catch (error: Error | any) {
            next(error);
        }
    };

    signOut = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("User not authenticated", 401);

            res.clearCookie("refresh-token", cookieConfig);

            return res.send(responseBuilder(200, "Logout successful", null));
        } catch (error: Error | any) {
            next(error);
        }
    };

    getAuthUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("User not authenticated", 401);

            const user = await userRepo.find({ id: (req.user as User).id });
            if (user) (user as any).password = null;

            return res.send(responseBuilder(200, "Success", user));
        } catch (error: Error | any) {
            next(error);
        }
    };

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("User not authenticated", 401);

            const { id } = req.user as User;

            const {
                user,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            } = await authService.refreshAccessToken(id);

            if (user) (user as any).password = null;

            return res.cookie("refresh-token", newRefreshToken, cookieConfig).send(
                responseBuilder(200, "Token refreshed successfully", {
                    user,
                    accessToken: newAccessToken,
                }),
            );
        } catch (error: Error | any) {
            next(error);
        }
    };
}

export default new AuthController();