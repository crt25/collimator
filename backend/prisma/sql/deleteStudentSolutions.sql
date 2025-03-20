-- @param {Int} $1:sessionId The id of the session in which the solution is to be deleted
-- @param {Int} $2:taskId The id of the task for which the solution is to be deleted
-- @param {Int} $3:studentSolutionId The id of the solution to be deleted

-- delete all students solutions for the given session/task combination
WITH studentToDelete AS (
  SELECT "studentId" as id
    FROM "StudentSolution" solution
    WHERE "id" = $3
      AND "sessionId" = $1
      AND "taskId" = $2
),
solutionsToDelete AS (
  SELECT "id", "taskId", "solutionHash"
    FROM "StudentSolution"
    WHERE "sessionId" = $1
      AND "taskId" = $2
      AND "studentId" IN (SELECT id FROM studentToDelete)
),
analysisDeleted AS (
  DELETE FROM "SolutionAnalysis" analysis
    USING solutionsToDelete AS solutionsToDelete
    WHERE "analysis"."taskId"       = solutionsToDelete."taskId"
    AND   "analysis"."solutionHash" = solutionsToDelete."solutionHash"
),
testsDeleted AS (
  DELETE FROM "SolutionTest"
    WHERE "studentSolutionId" IN (SELECT id FROM solutionsToDelete)
),
deletedIds AS (
  DELETE FROM "Solution" solution
    USING solutionsToDelete AS solutionsToDelete
    WHERE "solution"."taskId" = solutionsToDelete."taskId"
    AND   "solution"."hash"   = solutionsToDelete."solutionHash"
    RETURNING id
)
SELECT COUNT(*) FROM deletedIds;
