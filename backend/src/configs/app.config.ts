import express from "express";
import type { Application } from "express";
import cors from "cors";
import { CLIENT_ORIGIN } from "./env.config.js";

const app: Application = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: CLIENT_ORIGIN,
		credentials: true,
	}),
);

export default app;