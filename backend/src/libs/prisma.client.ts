import { DB_URL } from "../configs/env.config.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: DB_URL });
export const prisma = new PrismaClient({ adapter });