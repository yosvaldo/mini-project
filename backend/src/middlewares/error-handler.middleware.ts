import type { Request, Response, NextFunction } from "express";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    return res.status(status).send({
        status,
        message,
        error: err.object || null
    });
};

export default errorHandler;