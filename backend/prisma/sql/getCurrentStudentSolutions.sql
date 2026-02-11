-- @param {Int} $1:sessionId The id of the session for which the progress is to be retrieved
-- @param {Int} $2:studentId The id of the student for which the progress is to be retrieved
SELECT
  -- only select one per task https://stackoverflow.com/a/7630564/2897827
  DISTINCT ON (studentSolution."taskId")
  studentSolution."taskId",
  studentSolution."id" AS "studentSolutionId",
  COALESCE(COUNT(test.*), 0) AS "totalTests",
  COALESCE(COUNT(test.*) FILTER (WHERE test."passed"), 0) as "passedTests"
FROM "SessionTask" sessionTask
LEFT JOIN "StudentSolution" studentSolution
  ON sessionTask."taskId" = studentSolution."taskId"
  AND studentSolution."deletedAt" IS NULL
LEFT JOIN "SolutionTest" test
  ON test."studentSolutionId" = studentSolution."id"
  AND test."deletedAt" IS NULL
WHERE sessionTask."sessionId" = $1
AND studentSolution."studentId" = $2
GROUP BY studentSolution."taskId", studentSolution."id"
ORDER BY studentSolution."taskId", studentSolution."createdAt" DESC;