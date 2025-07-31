-- CreateEnum
CREATE TYPE "StudentActivityType" AS ENUM ('TASK_STARTED', 'TASK_RUN_SOLUTION', 'TASK_TEST_RESULTS', 'TASK_CLOSED', 'TASK_APP_ACTIVITY');

-- CreateTable
CREATE TABLE "StudentActivity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "StudentActivityType" NOT NULL,
    "happenedAt" TIMESTAMP(3) NOT NULL,
    "studentId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "solutionHash" BYTEA NOT NULL,

    CONSTRAINT "StudentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentActivityApp" (
    "id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "StudentActivityApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentActivity_studentId_type_happenedAt_key" ON "StudentActivity"("studentId", "type", "happenedAt");

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_sessionId_taskId_fkey" FOREIGN KEY ("sessionId", "taskId") REFERENCES "SessionTask"("sessionId", "taskId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_taskId_solutionHash_fkey" FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActivityApp" ADD CONSTRAINT "StudentActivityApp_id_fkey" FOREIGN KEY ("id") REFERENCES "StudentActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
