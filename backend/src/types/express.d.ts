import type { User as PrismaUser } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<PrismaUser, "password">;
    }
  }
}

export {};