import UserRepository from "../repositories/user.repository.js";
import { comparePassword } from "../libs/bcrypt.js";
import TokenService from "./token.service.js";
import { prisma } from "../libs/prisma.client.js";
import {
  ACCESS_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_SECRET,
  REFRESH_EXPIRES_IN,
} from "../libs/jwt.js";
import AppError from "../errors/app.error.js";

export class AuthService {
  static async signIn(email: string, plainPassword: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        points: { where: { isUsed: false, expiresAt: { gte: new Date() } } },
        coupons: { where: { isUsed: false, expiresAt: { gte: new Date() } } },
      }
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.password) {
      throw new AppError("Account password not set or logged in via OAuth", 400);
    }

    const isMatch = await comparePassword(plainPassword, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = TokenService.generate(
      payload,
      ACCESS_SECRET!,
      ACCESS_EXPIRES_IN || "15m"
    );
    const refreshToken = TokenService.generate(
      payload,
      REFRESH_SECRET!,
      REFRESH_EXPIRES_IN || "7d"
    );

    const totalPoints = user.points?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const { password, ...userWithoutPassword } = user;

    return {
      user: { ...userWithoutPassword, totalPoints },
      accessToken,
      refreshToken
    };
  }

  static async refreshAccessToken(userId: string) {
    const user = await UserRepository.find({ id: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = TokenService.generate(
      payload,
      ACCESS_SECRET!,
      ACCESS_EXPIRES_IN || "15m"
    );
    const refreshToken = TokenService.generate(
      payload,
      REFRESH_SECRET!,
      REFRESH_EXPIRES_IN || "7d"
    );

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

}

export default AuthService;