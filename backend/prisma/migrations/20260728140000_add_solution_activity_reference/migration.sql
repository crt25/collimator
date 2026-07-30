-- CreateTable
CREATE TABLE "SolutionActivityReference" (
    "solutionHash" BYTEA NOT NULL,
    "studentId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "SolutionActivityReference_pkey"
    PRIMARY KEY ("studentId", "sessionId", "taskId", "solutionHash")
);

-- CreateIndex
CREATE INDEX "SolutionActivityReference_sessionId_taskId_idx"
ON "SolutionActivityReference"("sessionId", "taskId");

-- CreateIndex
CREATE INDEX "SolutionActivityReference_taskId_solutionHash_idx"
ON "SolutionActivityReference"("taskId", "solutionHash");

-- Migrate every existing student solution and activity reference
INSERT INTO "SolutionActivityReference" (
    "solutionHash",
    "studentId",
    "sessionId",
    "taskId"
)
SELECT
    sourceReferences."solutionHash",
    sourceReferences."studentId",
    sourceReferences."sessionId",
    sourceReferences."taskId"
FROM (
    SELECT
        studentSolution."solutionHash",
        studentSolution."studentId",
        studentSolution."sessionId",
        studentSolution."taskId"
    FROM "StudentSolution" studentSolution
    WHERE studentSolution."isReference" = true

    UNION ALL

    SELECT
        studentActivity."solutionHash",
        studentActivity."studentId",
        studentActivity."sessionId",
        studentActivity."taskId"
    FROM "StudentActivity" studentActivity
    WHERE studentActivity."isReference" = true
) sourceReferences
GROUP BY
    sourceReferences."solutionHash",
    sourceReferences."studentId",
    sourceReferences."sessionId",
    sourceReferences."taskId";

-- AddForeignKey
ALTER TABLE "SolutionActivityReference"
ADD CONSTRAINT "SolutionActivityReference_taskId_solutionHash_fkey"
FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionActivityReference"
ADD CONSTRAINT "SolutionActivityReference_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionActivityReference"
ADD CONSTRAINT "SolutionActivityReference_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionActivityReference"
ADD CONSTRAINT "SolutionActivityReference_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionActivityReference"
ADD CONSTRAINT "SolutionActivityReference_sessionId_taskId_fkey"
FOREIGN KEY ("sessionId", "taskId") REFERENCES "SessionTask"("sessionId", "taskId")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the reference flags only after all existing values have been migrated.
ALTER TABLE "StudentSolution" DROP COLUMN "isReference";
ALTER TABLE "StudentActivity" DROP COLUMN "isReference";
