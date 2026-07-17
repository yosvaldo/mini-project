import crypto from "crypto";
import type { User, Role } from "../generated/prisma/client.js";
import { prisma } from "../libs/prisma.client.js";

class AuthRepository {
  async upsertSocialAccount(
    email: string,
    provider: string,
    providerAccountId: string,
    role?: string
  ): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const generatedReferralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

      const user = await tx.user.upsert({
        where: { email },
        create: { 
          email,
          fullName: email.split("@")[0],
          role: (role || "CUSTOMER") as Role,
          referralCode: generatedReferralCode
        },
        update: {},
      });

      await tx.account.upsert({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        create: {
          provider,
          providerAccountId,
          user: {
            connect: { id: user.id },
          },
        },
        update: {},
      });

      return user;
    });
  }
}

const authRepo = new AuthRepository();
export default authRepo;