-- Change onDelete from CASCADE to RESTRICT for soft-deletable entity relations
-- This prevents hard-deletion of children via DB cascade when parent is deleted
-- The Prisma extension will handle cascading soft-deletes instead

-- DropForeignKey (9 relations being changed from CASCADE to RESTRICT)
ALTER TABLE "EncryptedPrivateKey" DROP CONSTRAINT "EncryptedPrivateKey_publicKeyId_fkey";
ALTER TABLE "Session" DROP CONSTRAINT "Session_classId_fkey";
ALTER TABLE "ReferenceSolution" DROP CONSTRAINT "ReferenceSolution_taskId_fkey";
ALTER TABLE "ReferenceSolution" DROP CONSTRAINT "ReferenceSolution_taskId_solutionHash_fkey";
ALTER TABLE "StudentSolution" DROP CONSTRAINT "StudentSolution_taskId_solutionHash_fkey";
ALTER TABLE "StudentActivity" DROP CONSTRAINT "StudentActivity_studentId_fkey";
ALTER TABLE "StudentActivity" DROP CONSTRAINT "StudentActivity_sessionId_fkey";
ALTER TABLE "StudentActivity" DROP CONSTRAINT "StudentActivity_taskId_fkey";
ALTER TABLE "StudentActivity" DROP CONSTRAINT "StudentActivity_taskId_solutionHash_fkey";

-- AddForeignKey with ON DELETE RESTRICT
ALTER TABLE "EncryptedPrivateKey" ADD CONSTRAINT "EncryptedPrivateKey_publicKeyId_fkey" FOREIGN KEY ("publicKeyId") REFERENCES "KeyPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferenceSolution" ADD CONSTRAINT "ReferenceSolution_taskId_solutionHash_fkey" FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferenceSolution" ADD CONSTRAINT "ReferenceSolution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentSolution" ADD CONSTRAINT "StudentSolution_taskId_solutionHash_fkey" FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentActivity" ADD CONSTRAINT "StudentActivity_taskId_solutionHash_fkey" FOREIGN KEY ("taskId", "solutionHash") REFERENCES "Solution"("taskId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;
