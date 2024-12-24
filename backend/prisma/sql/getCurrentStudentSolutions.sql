-- @param {Int} $1:sessionId The id of the session for which the progress is to be retrieved
-- @param {Int} $2:studentId The id of the student for which the progress is to be retrieved
SELECT
  -- only select one per task https://stackoverflow.com/a/7630564/2897827
  DISTINCT ON (solution."taskId")
  sessionTask."taskId",
  solution."id" as "solutionId",
  solution."totalTests",
  solution."passedTests"
FROM "SessionTask" sessionTask
LEFT JOIN "Solution" solution ON sessionTask."taskId" = solution."taskId"
WHERE sessionTask."sessionId" = $1
AND solution."studentId" = $2
ORDER BY solution."taskId", solution."createdAt" DESC;