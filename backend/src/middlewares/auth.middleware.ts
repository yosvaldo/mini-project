import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/app.error.js";
import userRepo from "../repositories/user.repository.js"; 
import type { Role } from "../generated/prisma/enums.js";

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
			if ((req.user as any).role !== role)
				throw new AppError(`Access denied: ${role}s only`, 403);
			next();
		} catch (error) {
			next(error);
		}
	};