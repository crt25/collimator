/*
  Warnings:

  - Added the required column `passedTests` to the `Solution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTests` to the `Solution` table without a default value. This is not possible if the table is not empty.

*/

-- add new columns
ALTER TABLE "Solution"
ADD COLUMN "passedTests" INTEGER,
ADD COLUMN "totalTests" INTEGER;

-- Initialize with default values
UPDATE "Solution" SET "passedTests" = 0, "totalTests" = 0;

-- make new columns non-nullable
ALTER TABLE "Solution"
ALTER COLUMN "passedTests" SET NOT NULL,
ALTER COLUMN "totalTests" SET NOT NULL;