-- @param {Int} $1:sessionId The id of the session for which the analysis are to be retrieved
-- @param {Int} $2:taskId The id of the task for which the analysis are to be retrieved
(
WITH studentSolutions AS (
    SELECT
    -- only select one solution with all its tests per student https://stackoverflow.com/a/7630564/2897827
    DISTINCT ON (studentSolution."studentId")
    studentSolution.*
    FROM "StudentSolution" studentSolution
    WHERE studentSolution."sessionId" = $1
    AND studentSolution."taskId" = $2
    ORDER BY
      studentSolution."studentId",
      studentSolution."createdAt" DESC
    )
SELECT
  analysis.*,
  test."identifier" AS "testIdentifier",
  test."name" AS "testName",
  test."contextName" AS "testContextName",
  test."passed" AS "testPassed",
  studentSolutions."studentId" AS "studentId",
  student.pseudonym AS "studentPseudonym",
  student."keyPairId" AS "studentKeyPairId",
  false AS "isReference",
  studentSolutions."id" AS "studentSolutionId",
  studentSolutions."sessionId" AS "sessionId",
  NULL::int AS "referenceSolutionId",
  NULL::text AS "referenceSolutionTitle",
  NULL::text AS "referenceSolutionDescription"
FROM studentSolutions
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = studentSolutions."taskId"
  AND analysis."solutionHash" = studentSolutions."solutionHash"
LEFT JOIN "AuthenticatedStudent" student
  ON student."studentId" = studentSolutions."studentId"
INNER JOIN "SolutionTest" test
  ON test."studentSolutionId" = studentSolutions.id
  -- only select the latest solution if it is not a reference solution, otherwise it will already be included by the next union part
WHERE studentSolutions."isReference" = false
ORDER BY test."name" ASC
)

UNION ALL

-- select all student reference solutions
(
SELECT
  analysis.*,
  test."identifier" AS "testIdentifier",
  test."name" AS "testName",
  test."contextName" AS "testContextName",
  test."passed" AS "testPassed",
  studentSolution."studentId" AS "studentId",
  student.pseudonym AS "studentPseudonym",
  student."keyPairId" AS "studentKeyPairId",
  true AS "isReference",
  studentSolution."id" AS "studentSolutionId",
  studentSolution."sessionId" AS "sessionId",
  NULL::int AS "referenceSolutionId",
  NULL::text AS "referenceSolutionTitle",
  NULL::text AS "referenceSolutionDescription"
FROM "StudentSolution" studentSolution
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = studentSolution."taskId"
  AND analysis."solutionHash" = studentSolution."solutionHash"
LEFT JOIN "AuthenticatedStudent" student
  ON student."studentId" = studentSolution."studentId"
INNER JOIN "SolutionTest" test
  ON test."studentSolutionId" = studentSolution.id
WHERE studentSolution."sessionId" = $1
AND studentSolution."taskId" = $2
AND studentSolution."isReference" = true

)

UNION ALL

-- select all task reference solutions
(
SELECT
  analysis.*,
  test."identifier" AS "testIdentifier",
  test."name" AS "testName",
  test."contextName" AS "testContextName",
  test."passed" AS "testPassed",
  NULL::int AS "studentId",
  NULL AS "studentPseudonym",
  NULL AS "studentKeyPairId",
  true as "isReference",
  NULL::int AS "studentSolutionId",
  NULL::int AS "sessionId",
  referenceSolution."id" AS "referenceSolutionId",
  referenceSolution."title" AS "referenceSolutionTitle",
  referenceSolution."description" AS "referenceSolutionDescription"
FROM "ReferenceSolution" referenceSolution
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = referenceSolution."taskId"
  AND analysis."solutionHash" = referenceSolution."solutionHash"
INNER JOIN "SolutionTest" test
  ON test."referenceSolutionId" = referenceSolution.id
WHERE referenceSolution."taskId" = $2
)