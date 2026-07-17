import type { NextFunction } from "express";
import AppError from "../app.error.js"; 
import z from "zod";

export const appErrorHandler = (error: any, next: NextFunction) => {
	if (error instanceof z.ZodError) {
		const messages = error.issues
			.map((err: any) => `${err.path.join(" ")}: ${err.message}`)
			.join(", ");
		return next(new AppError(messages, 400, error));
	}
	return next(error);
};