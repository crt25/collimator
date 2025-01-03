-- @param {Int} $1:sessionId The id of the session for which the analysis are to be retrieved
-- @param {Int} $2:taskId The id of the task for which the analysis are to be retrieved
SELECT
  -- only select one per student https://stackoverflow.com/a/7630564/2897827
  DISTINCT ON (solution."studentId")
  analysis.*,
  solution."totalTests",
  solution."passedTests",
  student.pseudonym as "studentPseudonym",
  student."keyPairId" as "studentKeyPairId"
FROM "Solution" solution
INNER JOIN "SolutionAnalysis" analysis ON solution.id = analysis."solutionId"
INNER JOIN "Student" student ON student."id" = solution."studentId"
WHERE solution."sessionId" = $1
AND solution."taskId" = $2
ORDER BY solution."studentId", solution."createdAt" DESC;