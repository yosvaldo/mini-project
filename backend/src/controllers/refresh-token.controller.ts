import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app.error.js";
import AuthService from "../services/auth.service.js";
import TokenService from "../services/token.service.js";
import { REFRESH_SECRET } from "../libs/jwt.js";
import cookieConfig from "../configs/cookie.config.js";
import type { JwtPayload } from "jsonwebtoken";

const RefreshTokenController = {
    refreshToken: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validRefreshToken = req.cookies["refresh-token"];
            if (!validRefreshToken) throw new AppError("Refresh token not provided", 401);

            const decode = TokenService.verify(validRefreshToken, REFRESH_SECRET!) as JwtPayload;
            if (!decode || !decode.id) throw new AppError("Invalid refresh token", 403);

            const { user, accessToken, refreshToken } = await AuthService.refreshAccessToken(decode.id);

            res.clearCookie("refresh-token", cookieConfig);
            res.cookie("refresh-token", refreshToken, cookieConfig).send({
                message: "Token refreshed successfully",
                data: { user, accessToken },
            });
        } catch (error) {
            next(error);
        }
    },
};

export default RefreshTokenController;