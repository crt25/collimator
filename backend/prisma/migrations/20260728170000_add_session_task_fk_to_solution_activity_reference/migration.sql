-- AddForeignKey
ALTER TABLE "SolutionActivityReference"
ADD CONSTRAINT "SolutionActivityReference_sessionId_taskId_fkey"
FOREIGN KEY ("sessionId", "taskId") REFERENCES "SessionTask"("sessionId", "taskId")
ON DELETE RESTRICT ON UPDATE CASCADE;
