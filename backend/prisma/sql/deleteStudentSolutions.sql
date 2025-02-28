-- @param {Int} $1:sessionId The id of the session in which the solution is to be deleted
-- @param {Int} $2:taskId The id of the task for which the solution is to be deleted
-- @param {Int} $3:solutionId The id of the solution to be deleted

-- delete all students solutions for the given session/task combination
WITH studentToDelete AS (
  SELECT "studentId" as id
    FROM "Solution" solution
    WHERE id = $3
      AND "sessionId" = $1
      AND "taskId" = $2
),
solutionsToDelete AS (
  SELECT id
    FROM "Solution"
    WHERE "sessionId" = $1
      AND "taskId" = $2
      AND "studentId" IN (SELECT id FROM studentToDelete)
),
analysisDeleted AS (
  DELETE FROM "SolutionAnalysis"
    WHERE "solutionId" IN (SELECT id FROM solutionsToDelete)
),
testsDeleted AS (
  DELETE FROM "SolutionTest"
    WHERE "solutionId" IN (SELECT id FROM solutionsToDelete)
),
deletedIds AS (
  DELETE FROM "Solution"
    WHERE id IN (SELECT id FROM solutionsToDelete)
    RETURNING id
)
SELECT COUNT(*) FROM deletedIds;
