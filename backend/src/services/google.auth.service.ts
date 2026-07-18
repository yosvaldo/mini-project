import { OAuth2Client } from "google-auth-library";
import { prisma } from "../libs/prisma.client.js";
import AppError from "../errors/app.error.js";
import TokenService from "./token.service.js";
import { 
    GOOGLE_CLIENT_ID, 
    JWT_ACCESS_SECRET, 
    JWT_REFRESH_SECRET, 
    JWT_ACCESS_EXPIRES_IN, 
    JWT_REFRESH_EXPIRES_IN 
} from "../configs/env.config.js";
import type { Role } from "../generated/prisma/enums.js";

const GoogleAuthService = {
    async verifyIdToken(idToken: string, role: Role = "USER" as Role) {
        if (!GOOGLE_CLIENT_ID) {
            throw new AppError("Google Client ID environment variable configuration missing", 500);
        }

        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.sub) {
            throw new AppError("Invalid Google ID token claims structure", 400);
        }

        const userEmail = payload.email;
        const providerId = payload.sub;

        const user = await prisma.$transaction(async (tx) => {
            const generatedReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            const user = await tx.user.upsert({
                where: { email: userEmail },
                update: {},
                create: {
                    email: userEmail,
                    role: role,
                    fullName: payload.name || userEmail.split("@")[0],
                    referralCode: generatedReferralCode,
                },
            });

            await tx.account.upsert({
                where: {
                    provider_providerAccountId: {
                        provider: "google",
                        providerAccountId: providerId,
                    },
                },
                create: {
                    provider: "google",
                    providerAccountId: providerId,
                    userId: user.id,
                },
                update: {},
            });

            return user;
        });

        const accessToken = TokenService.generate(
            { id: String(user.id), role: user.role },
            JWT_ACCESS_SECRET!,
            JWT_ACCESS_EXPIRES_IN!
        );

        const refreshToken = TokenService.generate(
            { id: String(user.id) },
            JWT_REFRESH_SECRET!,
            JWT_REFRESH_EXPIRES_IN!
        );

        return {
            user: { ...user, password: null },
            accessToken,
            refreshToken,
        };
    },
};

export default GoogleAuthService;