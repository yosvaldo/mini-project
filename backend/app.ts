import express from "express";
import type { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

const app: Application = express();
const PORT = process.env.APP_PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
	}),
);

app.get("/", (_req: Request, res: Response) => {
	res.send({ message: "Welcome to the backend API" });
});

app.use((_req: Request, res: Response) => {
	res.status(404).send({
		message: "Endpoint not found",
	});
});

app.use(
	(
		error: Error | unknown,
		_req: Request,
		res: Response,
		_next: NextFunction,
	) => {
		res.status(500).send({
			message: "An error occurred on the server",
			error: error instanceof Error ? error.message : error,
		});
	},
);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
