-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'DONE', 'REJECTED');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';
