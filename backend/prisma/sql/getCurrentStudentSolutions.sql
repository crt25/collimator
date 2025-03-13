-- @param {Int} $1:sessionId The id of the session for which the progress is to be retrieved
-- @param {Int} $2:studentId The id of the student for which the progress is to be retrieved
SELECT
  -- only select one per task https://stackoverflow.com/a/7630564/2897827
  DISTINCT ON (solution."taskId")
  sessionTask."taskId",
  solution."id" AS "solutionId",
  COALESCE(COUNT(test.*), 0) AS "totalTests",
  COALESCE(COUNT(test.*) FILTER (WHERE test."passed"), 0) as "passedTests"
FROM "SessionTask" sessionTask
LEFT JOIN "Solution" solution ON sessionTask."taskId" = solution."taskId"
INNER JOIN "SolutionTest" test ON test."solutionId" = solution.id
WHERE sessionTask."sessionId" = $1
AND solution."studentId" = $2
GROUP BY solution."id", sessionTask."taskId"
ORDER BY solution."taskId", solution."createdAt" DESC;