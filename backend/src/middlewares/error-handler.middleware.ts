import type { Request, Response, NextFunction } from "express";
import { appErrorHandler } from "../errors/handlers/app.error.handler.js";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    appErrorHandler(err, next);
    
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    return res.status(status).send({
        status,
        message,
        error: err.object || null
    });
};

export default errorHandler;