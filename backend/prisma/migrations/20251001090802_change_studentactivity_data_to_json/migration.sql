/*
  Warnings:

  - Changed the type of `data` on the `StudentActivityApp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

  Why this is okay:
  It is okay to do that since the StudentActivityApp has not been used so far, which means it cannot have any data in it.

*/
-- AlterTable
ALTER TABLE "StudentActivityApp" DROP COLUMN "data",
ADD COLUMN     "data" JSONB NOT NULL;
