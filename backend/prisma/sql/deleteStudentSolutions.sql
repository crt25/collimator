-- @param {Int} $1:sessionId The id of the session in which the solution is to be deleted
-- @param {Int} $2:taskId The id of the task for which the solution is to be deleted
-- @param {Int} $3:studentSolutionId The id of the solution to be deleted
-- soft-delete all students solutions for the given session/task combination
WITH studentToDelete AS (
  SELECT "studentId" as id
  FROM "StudentSolution"
  WHERE "id" = $3
    AND "sessionId" = $1
    AND "taskId" = $2
    AND "deletedAt" IS NULL
),
solutionsToDelete AS (
  SELECT "id", "taskId", "solutionHash"
  FROM "StudentSolution"
  WHERE "sessionId" = $1
    AND "taskId" = $2
    AND "studentId" IN (SELECT id FROM studentToDelete)
    AND "deletedAt" IS NULL
),
analysisDeleted AS (
  UPDATE "SolutionAnalysis"
  SET "deletedAt" = NOW()
  FROM solutionsToDelete
  WHERE "SolutionAnalysis"."taskId" = solutionsToDelete."taskId"
    AND "SolutionAnalysis"."solutionHash" = solutionsToDelete."solutionHash"
    AND "SolutionAnalysis"."deletedAt" IS NULL
  RETURNING "SolutionAnalysis"."taskId"
),
testsDeleted AS (
  UPDATE "SolutionTest"
  SET "deletedAt" = NOW()
  WHERE "studentSolutionId" IN (SELECT id FROM solutionsToDelete)
    AND "deletedAt" IS NULL
  RETURNING id
),
solutionsDeleted AS (
  UPDATE "Solution"
  SET "deletedAt" = NOW()
  FROM solutionsToDelete
  WHERE "Solution"."taskId" = solutionsToDelete."taskId"
    AND "Solution"."hash" = solutionsToDelete."solutionHash"
    AND "Solution"."deletedAt" IS NULL
  RETURNING "Solution"."taskId"
),
studentSolutionsDeleted AS (
  UPDATE "StudentSolution"
  SET "deletedAt" = NOW()
  WHERE "id" IN (SELECT id FROM solutionsToDelete)
    AND "deletedAt" IS NULL
  RETURNING id
)
SELECT COUNT(*) FROM studentSolutionsDeleted;
