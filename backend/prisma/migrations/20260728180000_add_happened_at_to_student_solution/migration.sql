-- AlterTable
ALTER TABLE "StudentSolution" ADD COLUMN "happenedAt" TIMESTAMP(3);

-- Backfill existing rows with server createdAt so the column can be NOT NULL
UPDATE "StudentSolution" SET "happenedAt" = "createdAt" WHERE "happenedAt" IS NULL;

-- AlterTable
ALTER TABLE "StudentSolution" ALTER COLUMN "happenedAt" SET NOT NULL;
