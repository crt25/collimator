-- CreateTable
CREATE TABLE "SolutionActivityReference" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solutionHash" BYTEA NOT NULL,
    "studentId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "SolutionActivityReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolutionActivityReference_solutionHash_studentId_sessionId_classId_taskId_key"
ON "SolutionActivityReference"("solutionHash", "studentId", "sessionId", "classId", "taskId");

-- CreateIndex
CREATE INDEX "SolutionActivityReference_sessionId_taskId_idx"
ON "SolutionActivityReference"("sessionId", "taskId");

-- Migrate every existing student solution and activity reference
INSERT INTO "SolutionActivityReference" (
    "solutionHash",
    "studentId",
    "sessionId",
    "classId",
    "taskId",
    "createdAt"
)
SELECT
    sourceReferences."solutionHash",
    sourceReferences."studentId",
    sourceReferences."sessionId",
    sourceReferences."classId",
    sourceReferences."taskId",
    MIN(sourceReferences."createdAt")
FROM (
    SELECT
        studentSolution."solutionHash",
        studentSolution."studentId",
        studentSolution."sessionId",
        session."classId",
        studentSolution."taskId",
        studentSolution."createdAt"
    FROM "StudentSolution" studentSolution
    INNER JOIN "Session" session ON session."id" = studentSolution."sessionId"
    WHERE studentSolution."isReference" = true

    UNION ALL

    SELECT
        studentActivity."solutionHash",
        studentActivity."studentId",
        studentActivity."sessionId",
        session."classId",
        studentActivity."taskId",
        studentActivity."createdAt"
    FROM "StudentActivity" studentActivity
    INNER JOIN "Session" session ON session."id" = studentActivity."sessionId"
    WHERE studentActivity."isReference" = true
) sourceReferences
GROUP BY
    sourceReferences."solutionHash",
    sourceReferences."studentId",
    sourceReferences."sessionId",
    sourceReferences."classId",
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
ADD CONSTRAINT "SolutionActivityReference_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Class"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionActivityReference"
ADD CONSTRAINT "SolutionActivityReference_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the reference flags only after all existing values have been migrated.
ALTER TABLE "StudentSolution" DROP COLUMN "isReference";
ALTER TABLE "StudentActivity" DROP COLUMN "isReference";
