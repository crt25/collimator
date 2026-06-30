-- The 20260318 migration that added the "deletedAt IS NULL" partial condition to
-- the StudentActivity unique index accidentally dropped "happenedAtCounter" from
-- the column list, reverting 20260316. 

-- Restore happenedAtCounter to the index

DROP INDEX "StudentActivity_studentId_type_happenedAt_key";

CREATE UNIQUE INDEX "StudentActivity_studentId_type_happenedAt_key"
  ON "StudentActivity"("studentId", "type", "happenedAt", "happenedAtCounter")
  WHERE "deletedAt" IS NULL;
