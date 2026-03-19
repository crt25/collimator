-- This migration updates the unique constraints to partially include the "deletedAt" column. 
-- This allows creating the same items multiple times if they are soft deleted.

DROP INDEX "StudentActivity_studentId_type_happenedAt_key";
DROP INDEX "ReferenceSolution_taskId_solutionHash_key";

CREATE UNIQUE INDEX "StudentActivity_studentId_type_happenedAt_key" ON "StudentActivity"("studentId", "type", "happenedAt") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "ReferenceSolution_taskId_solutionHash_key" ON "ReferenceSolution"("taskId", "solutionHash") WHERE "deletedAt" IS NULL;