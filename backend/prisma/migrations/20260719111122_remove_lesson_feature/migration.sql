-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_basedOnLessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonTask" DROP CONSTRAINT "LessonTask_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonTask" DROP CONSTRAINT "LessonTask_taskId_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "basedOnLessonId";

-- DropTable
DROP TABLE "Lesson";

-- DropTable
DROP TABLE "LessonTask";

-- DropEnum
DROP TYPE "LessonVisibility";

