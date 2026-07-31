import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app.error.js";
import authService from "../services/auth.service.js";
import tokenService from "../services/token.service.js";
import { REFRESH_SECRET } from "../libs/jwt.js";
import cookieConfig from "../configs/cookie.config.js";
import { responseBuilder } from "../utils/response-builder.util.js";
import type { JwtPayload } from "jsonwebtoken";

const RefreshTokenController = {
    refreshToken: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validRefreshToken = req.cookies["refresh-token"];
            if (!validRefreshToken) throw new AppError("Refresh token not provided", 401);

            const decode = tokenService.verify(validRefreshToken, REFRESH_SECRET!) as JwtPayload;
            if (!decode || !decode.id) throw new AppError("Invalid refresh token", 403);

            const { user, accessToken, refreshToken } = await authService.refreshAccessToken(decode.id);

            res.clearCookie("refresh-token", cookieConfig);
            return res
                .cookie("refresh-token", refreshToken, cookieConfig)
                .send(responseBuilder(200, "Token refreshed successfully", { user, accessToken }));
        } catch (error) {
            next(error);
        }
    },
};

export default RefreshTokenController;