import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma.client.js";

const UserController = {
	async getAll(req: Request, res: Response, next: NextFunction) {
		const users = await prisma.user.findMany({
			omit: { password: true },
		});
		res.send({
			message: "Users retrieved successfully",
			data: users,
		});
	},
};

export default UserController;