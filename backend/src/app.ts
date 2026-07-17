import type { Application, Request, Response } from "express";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoute from "./routes/api.route.js"; 
import corsOptions from "./configs/cors.config.js";
import errorHandler from "./middlewares/error-handler.middleware.js";

export const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api", apiRoute);

app.use((_: Request, res: Response) => {
    console.error("404 Not Found");
    return res.status(404).send({ message: "Not Found" });
});

app.use(errorHandler);