import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";

const requestValidator =
	(schema: ZodObject, source: "body" | "query" | "params" = "body") =>
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const validatedData = await schema.parseAsync(req[source]);
			req[source] = validatedData;
			next();
		} catch (error) {
			next(error);
		}
	};

export default requestValidator;