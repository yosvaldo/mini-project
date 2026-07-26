import type { NextFunction } from "express";
import AppError from "../app.error.js";
import { Prisma } from "../../generated/prisma/client.js";
import z from "zod";
import jwt from "jsonwebtoken";

const { TokenExpiredError, JsonWebTokenError } = jwt;

export const appErrorHandler = (
    error: any,
    next: NextFunction,
) => {
    if (error instanceof AppError) {
        return next(error);
    }

    if (error instanceof TokenExpiredError) {
        return next(new AppError("Token expired", 401));
    }

    if (error instanceof JsonWebTokenError) {
        return next(new AppError("Invalid token", 401));
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return next(new AppError("Already exists", 409));

            case "P2025":
                return next(new AppError("Record not found", 404));

            default:
                return next(new AppError("Database error", 400));
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return next(
            new AppError("Invalid data parameters provided", 400),
        );
    }

    if (error instanceof z.ZodError) {
        const messages = error.issues
            .map((err) => `${err.path.join(".")}: ${err.message}`)
            .join(", ");

        return next(new AppError(messages, 400));
    }

    return next(
        new AppError(
            error?.message || "Internal Server Error",
            error?.status ?? 500,
        ),
    );
};