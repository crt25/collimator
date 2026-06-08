-- Composite indexes on StudentActivity to fix transaction timeouts in
-- updateStudentActivityIsReference (studentId + solutionHash)
-- the (taskId, solutionHash) for joins in getCurrentAnalysesWithActivities.
CREATE INDEX "StudentActivity_studentId_solutionHash_idx" ON "StudentActivity"("studentId", "solutionHash");
CREATE INDEX "StudentActivity_taskId_solutionHash_idx" ON "StudentActivity"("taskId", "solutionHash");
