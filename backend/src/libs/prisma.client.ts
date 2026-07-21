import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client.js";
import { DB_URL } from "../configs/env.config.js";

const adapter = new PrismaNeon({
  connectionString: DB_URL,
});

export const prisma = new PrismaClient({
  adapter,
});