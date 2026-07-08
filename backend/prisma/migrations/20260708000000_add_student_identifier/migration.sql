-- AlterTable
ALTER TABLE "AuthenticatedStudent" ADD COLUMN     "studentIdentifier" BYTEA;

-- Partial unique index for the deterministic student identifier.
-- Mirrors the soft-delete pattern used for the other unique constraints: uniqueness
-- is enforced only over non-deleted rows so a soft-deleted student can later be
-- re-created. NULL identifiers (legacy rows) are treated as distinct by Postgres,
-- so they do not conflict with each other.
-- Prisma doesn't natively support partial indexes, so this is done via raw SQL.
-- DO NOT modify this index through the Prisma schema, it must remain a partial index.
CREATE UNIQUE INDEX "AuthenticatedStudent_studentIdentifier_classId_key"
ON "AuthenticatedStudent"("studentIdentifier", "classId")
WHERE "deletedAt" IS NULL;
