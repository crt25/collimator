-- DropForeignKey
ALTER TABLE "ReferenceSolution" DROP CONSTRAINT "ReferenceSolution_taskId_fkey";

-- AddForeignKey
ALTER TABLE "ReferenceSolution" ADD CONSTRAINT "ReferenceSolution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
