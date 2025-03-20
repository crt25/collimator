-- Drop foreign keys
ALTER TABLE "Solution"
  DROP CONSTRAINT "Solution_sessionId_fkey",
  DROP CONSTRAINT "Solution_sessionId_taskId_fkey",
  DROP CONSTRAINT "Solution_studentId_fkey";

ALTER TABLE "SolutionAnalysis" DROP CONSTRAINT "SolutionAnalysis_solutionId_fkey";
ALTER TABLE "SolutionTest" DROP CONSTRAINT "SolutionTest_solutionId_fkey";

-- AlterTable
ALTER TABLE "Solution"
  ADD COLUMN      "hash" BYTEA,
  DROP CONSTRAINT "Solution_pkey";

-- AlterTable
ALTER TABLE "SolutionAnalysis"
  ADD COLUMN     "solutionHash" BYTEA,
  ADD COLUMN     "taskId" INTEGER,
  DROP CONSTRAINT "SolutionAnalysis_pkey";

-- AlterTable
ALTER TABLE "SolutionTest"
  ADD COLUMN     "referenceSolutionId" INTEGER,
  ADD COLUMN     "studentSolutionId" INTEGER;

-- Create new tables
CREATE TABLE "ReferenceSolution" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "solutionHash" BYTEA NOT NULL,

    CONSTRAINT "ReferenceSolution_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StudentSolution" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" INTEGER NOT NULL,
    "solutionHash" BYTEA NOT NULL,
    "studentId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "isReference" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentSolution_pkey" PRIMARY KEY ("id")
);

-- Create indicies
CREATE UNIQUE INDEX "ReferenceSolution_taskId_solutionHash_key" ON "ReferenceSolution"("taskId", "solutionHash");

-- Data migration
UPDATE "Solution"
  SET "hash" = sha256("data");

UPDATE "SolutionAnalysis"
  SET "solutionHash" = "Solution"."hash",
      "taskId" = "Solution"."taskId"
  FROM "Solution"
  WHERE "SolutionAnalysis"."solutionId" = "Solution"."id";

INSERT INTO
  "StudentSolution" ("taskId", "solutionHash", "sessionId", "studentId", "createdAt")
  SELECT "taskId", "hash", "sessionId", "studentId", "createdAt" FROM "Solution";

UPDATE "SolutionTest"
  SET "studentSolutionId" = "StudentSolution"."id"
  FROM "StudentSolution" INNER JOIN "Solution"
    ON  "StudentSolution"."taskId" = "Solution"."taskId"
    AND "StudentSolution"."solutionHash" = "Solution"."hash"
  WHERE "SolutionTest"."solutionId" = "Solution"."id";

-- Drop indices
DROP INDEX "SolutionAnalysis_solutionId_key";

-- Drop duplicate solutions by only keeping the minimum id for each task and hash
DELETE FROM "Solution"
  WHERE "id" NOT IN (
    SELECT MIN("id")
    FROM "Solution"
    GROUP BY "taskId", "hash"
  );

-- Drop duplicate analyses by only keeping the minimum id for each task and hash
DELETE FROM "SolutionAnalysis"
  WHERE "id" NOT IN (
    SELECT MIN("id")
    FROM "SolutionAnalysis"
    GROUP BY "taskId", "solutionHash"
  );

-- Drop columns
ALTER TABLE "Solution"
  DROP COLUMN "createdAt",
  DROP COLUMN "id",
  DROP COLUMN "sessionId",
  DROP COLUMN "studentId",
  ADD CONSTRAINT  "Solution_pkey" PRIMARY KEY ("taskId", "hash");

ALTER TABLE "SolutionAnalysis"
  DROP COLUMN "id",
  DROP COLUMN "solutionId";

ALTER TABLE "SolutionTest"
  DROP COLUMN "solutionId";

-- Make columns non-nullable
ALTER TABLE "Solution"
  ALTER COLUMN "hash" SET NOT NULL;

ALTER TABLE "SolutionAnalysis"
  ALTER COLUMN "solutionHash" SET NOT NULL,
  ALTER COLUMN "taskId" SET NOT NULL,
  ADD CONSTRAINT "SolutionAnalysis_pkey" PRIMARY KEY ("taskId", "solutionHash");

-- Create foreign keys
ALTER TABLE "ReferenceSolution" ADD CONSTRAINT "ReferenceSolution_taskId_solutionHash_fkey" FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferenceSolution" ADD CONSTRAINT "ReferenceSolution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentSolution" ADD CONSTRAINT "StudentSolution_taskId_solutionHash_fkey" FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentSolution" ADD CONSTRAINT "StudentSolution_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentSolution" ADD CONSTRAINT "StudentSolution_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentSolution" ADD CONSTRAINT "StudentSolution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentSolution" ADD CONSTRAINT "StudentSolution_sessionId_taskId_fkey" FOREIGN KEY ("sessionId", "taskId") REFERENCES "SessionTask"("sessionId", "taskId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SolutionTest" ADD CONSTRAINT "SolutionTest_referenceSolutionId_fkey" FOREIGN KEY ("referenceSolutionId") REFERENCES "ReferenceSolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SolutionTest" ADD CONSTRAINT "SolutionTest_studentSolutionId_fkey" FOREIGN KEY ("studentSolutionId") REFERENCES "StudentSolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SolutionAnalysis" ADD CONSTRAINT "SolutionAnalysis_taskId_solutionHash_fkey" FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;
