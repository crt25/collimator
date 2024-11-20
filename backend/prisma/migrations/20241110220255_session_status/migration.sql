-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('CREATED', 'ONGOING', 'PAUSED', 'FINISHED');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'CREATED';
