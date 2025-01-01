-- CreateEnum
CREATE TYPE "AstVersion" AS ENUM ('v0', 'v1');

-- AlterTable
ALTER TABLE "SolutionAnalysis" ADD COLUMN     "astVersion" "AstVersion" NOT NULL DEFAULT 'v0';
