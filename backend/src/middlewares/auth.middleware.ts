import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/app.error.js";
import userRepo from "../repositories/user.repository.js"; 
import type { Role } from "../generated/prisma/enums.js";
import TokenService from "../services/token.service.js";
import { ACCESS_SECRET, REFRESH_SECRET } from "../libs/jwt.js";

export const uniqueUserGuard = async (
    req: Request,
    _: Response,
    next: NextFunction,
) => {
    try {
        const { email } = req.body;
        const user = await userRepo.find({ email });
        if (user) throw new AppError("User already exists", 400);
        next();
    } catch (error) {
        next(error);
    }
};

export const roleGuard =
    (role: Role) => async (req: Request, _: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new AppError("User not authenticated", 401);
            if (req.user.role !== role)
                throw new AppError(`Access denied: ${role}s only`, 403);
            next();
        } catch (error) {
            next(error);
        }
    };

export const verifyToken =
    (type: "access" | "refresh") =>
    async (req: Request, _: Response, next: NextFunction) => {
        try {
            let token: string | undefined;
            let secret: string | undefined;

            if (type === "access") {
                token = req.headers.authorization?.split(" ")[1];
                secret = ACCESS_SECRET;
            } else if (type === "refresh") {
                token = req.cookies["refresh-token"];
                secret = REFRESH_SECRET;
            }

            if (!token) return next(new AppError("Token not provided", 401));
            if (!secret) return next(new AppError("Secret not provided", 500));

            const decode = TokenService.verify(token, secret);
            if (!decode) return next(new AppError("Invalid token", 403));

            req.user = decode as any;
            next();
        } catch (error) {
            next(error);
        }
    };