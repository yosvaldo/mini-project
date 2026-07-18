import authRepo from "../repositories/auth.repository.js"; 
import userRepo from "../repositories/user.repository.js"; 
import TokenService from "./token.service.js";
import GoogleAuthService from "./google.auth.service.js";
import { comparePassword } from "../libs/bcrypt.js";
import { ACCESS_SECRET, REFRESH_SECRET, ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from "../libs/jwt.js";
import AppError from "../errors/app.error.js";
import type { Role } from "../generated/prisma/enums.js";

class AuthService {
    async signIn(email: string, plain: string) {
        const user = await userRepo.find({ email });
        if (!user || !user.password) throw new AppError("Invalid credentials", 401);

        const match = await comparePassword(plain, user.password);
        if (!match) throw new AppError("Invalid credentials", 401);

        const accessToken = TokenService.generate({ id: String(user.id), role: user.role }, ACCESS_SECRET!, ACCESS_EXPIRES_IN!);
        const refreshToken = TokenService.generate({ id: String(user.id) }, REFRESH_SECRET!, REFRESH_EXPIRES_IN!);

        return { accessToken, refreshToken };
    }

    async googleSignIn(idToken: string, role?: string) {
        const assignedRole = (role || "USER") as Role;
        return await GoogleAuthService.verifyIdToken(idToken, assignedRole);
    }

    async refreshAccessToken(userId: number | string) {
        const queryId = typeof userId === "string" ? Number(userId) || userId : userId;
        const user = await userRepo.find({ id: queryId as any });
        if (!user) throw new AppError("User context not found", 401);

        const accessToken = TokenService.generate({ id: String(user.id), role: user.role }, ACCESS_SECRET!, ACCESS_EXPIRES_IN!);
        const refreshToken = TokenService.generate({ id: String(user.id) }, REFRESH_SECRET!, REFRESH_EXPIRES_IN!);
        return { user, accessToken, refreshToken };
    }
}

export default new AuthService();