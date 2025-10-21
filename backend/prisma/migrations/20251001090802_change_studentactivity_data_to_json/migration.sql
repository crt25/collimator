/*
  Warnings:

  - Changed the type of `data` on the `StudentActivityApp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

  Why this is okay:
  The application is not yet in production, so there is no production data to worry about.
  Furthermore, the application is still in active development, so any development data can be discarded. 

*/
-- AlterTable
ALTER TABLE "StudentActivityApp" DROP COLUMN "data",
ADD COLUMN     "data" JSONB NOT NULL;
