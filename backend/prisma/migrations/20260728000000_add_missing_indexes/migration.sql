-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE INDEX "AuthenticatedStudent_classId_idx" ON "AuthenticatedStudent"("classId");

-- CreateIndex
CREATE INDEX "AuthenticatedStudent_keyPairId_idx" ON "AuthenticatedStudent"("keyPairId");

-- CreateIndex
CREATE INDEX "AnonymousStudent_sessionId_idx" ON "AnonymousStudent"("sessionId");

-- CreateIndex
CREATE INDEX "Session_classId_idx" ON "Session"("classId");

-- CreateIndex
CREATE INDEX "Task_creatorId_isPublic_idx" ON "Task"("creatorId", "isPublic");

-- CreateIndex
CREATE INDEX "SessionTask_taskId_idx" ON "SessionTask"("taskId");

-- CreateIndex
CREATE INDEX "StudentSolution_sessionId_taskId_studentId_createdAt_idx" ON "StudentSolution"("sessionId", "taskId", "studentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StudentSolution_studentId_taskId_idx" ON "StudentSolution"("studentId", "taskId");

-- CreateIndex
CREATE INDEX "StudentSolution_taskId_solutionHash_idx" ON "StudentSolution"("taskId", "solutionHash");

-- CreateIndex
CREATE INDEX "SolutionTest_studentSolutionId_idx" ON "SolutionTest"("studentSolutionId");

-- CreateIndex
CREATE INDEX "SolutionTest_referenceSolutionId_idx" ON "SolutionTest"("referenceSolutionId");

-- CreateIndex
CREATE INDEX "AuthenticationToken_lastUsedAt_idx" ON "AuthenticationToken"("lastUsedAt");

-- CreateIndex
CREATE INDEX "AuthenticationToken_userId_idx" ON "AuthenticationToken"("userId");

-- CreateIndex
CREATE INDEX "StudentActivity_sessionId_taskId_idx" ON "StudentActivity"("sessionId", "taskId");

