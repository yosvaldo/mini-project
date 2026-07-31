import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import app from "./configs/app.config.js";
import apiRoute from "./routes/api.route.js";
import errorHandler from "./middlewares/error-handler.middleware.js";

app.use(cookieParser());

app.use("/api", apiRoute);

app.use((_: Request, res: Response) => {
    return res.status(404).send({ message: "Not Found" });
});

app.use(errorHandler);

export { app };
export default app;