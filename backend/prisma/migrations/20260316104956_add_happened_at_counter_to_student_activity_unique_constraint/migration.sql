
-- This migration adds a new column 'happenedAtCounter' to the student activity table
-- updates the unique constraint to include the new column to allow multiple activities of the same type at the same time.
-- Timestamps alone are not enough to guarantee uniqueness as multiple activities can happen at the same time, so we need a counter to differentiate them.
ALTER TABLE "StudentActivity" ADD COLUMN "happenedAtCounter" INTEGER NOT NULL DEFAULT 0;

DROP INDEX "StudentActivity_studentId_type_happenedAt_key";

CREATE UNIQUE INDEX "StudentActivity_studentId_type_happenedAt_key" ON "StudentActivity"("studentId", "type", "happenedAt", "happenedAtCounter");