/*
  Warnings:

  - You are about to drop the column `passedTests` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the column `totalTests` on the `Solution` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SolutionTest" (
    "id" SERIAL NOT NULL,
    "solutionId" INTEGER NOT NULL,
    "identifier" TEXT,
    "name" TEXT NOT NULL,
    "contextName" TEXT,
    "passed" BOOLEAN NOT NULL,

    CONSTRAINT "SolutionTest_pkey" PRIMARY KEY ("id")
);

-- Migrate the data

INSERT INTO "SolutionTest" ("solutionId", "identifier", "name", "contextName", "passed")
SELECT s.id as "solutionId", null as "identifier", CONCAT('Failed test ', "failedTest") as "name", null as "contextName", false as "passed"
  FROM public."Solution" s, generate_series(1,1000) "failedTest"
  WHERE
    (s."totalTests" - s."passedTests") >= "failedTest"

UNION ALL

SELECT s.id as "solutionId", null as "identifier", CONCAT('Passed test ', "passedTest") as "name", null as "contextName", true as "passed"
  FROM public."Solution" s, generate_series(1,1000) "passedTest"
  WHERE
    s."passedTests" >= "passedTest";

-- AddForeignKey
ALTER TABLE "SolutionTest" ADD CONSTRAINT "SolutionTest_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Solution" DROP COLUMN "passedTests",
DROP COLUMN "totalTests";
