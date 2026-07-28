-- @param {Int} $1:sessionId The id of the session for which the analysis are to be retrieved
-- @param {Int} $2:taskId The id of the task for which the analysis are to be retrieved
WITH studentSolutions AS (
    SELECT
    -- only select one solution with all its tests per student https://stackoverflow.com/a/7630564/2897827
    DISTINCT ON (studentSolution."studentId")
    studentSolution.*,
    (reference."id" IS NOT NULL) AS "isReference"
    FROM "StudentSolution" studentSolution
    LEFT JOIN "SolutionActivityReference" reference
      ON reference."studentId" = studentSolution."studentId"
      AND reference."sessionId" = studentSolution."sessionId"
      AND reference."taskId" = studentSolution."taskId"
      AND reference."solutionHash" = studentSolution."solutionHash"
    WHERE studentSolution."sessionId" = $1
    AND studentSolution."taskId" = $2
    AND studentSolution."deletedAt" IS NULL
    ORDER BY
      studentSolution."studentId",
      studentSolution."createdAt" DESC
    )
(
SELECT
  analysis.*,
  test."identifier" AS "testIdentifier",
  test."name" AS "testName",
  test."contextName" AS "testContextName",
  test."passed" AS "testPassed",
  studentSolutions."studentId" AS "studentId",
  student.pseudonym AS "studentPseudonym",
  student."keyPairId" AS "studentKeyPairId",
  studentSolutions."isReference" AS "isReference",
  true AS "isLatest",
  studentSolutions."id" AS "studentSolutionId",
  true AS "isStudentSolution",
  studentSolutions."sessionId" AS "sessionId",
  NULL::int AS "referenceSolutionId",
  NULL::text AS "referenceSolutionTitle",
  NULL::text AS "referenceSolutionDescription",
  NULL::boolean AS "isInitialTaskSolution"
FROM studentSolutions
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = studentSolutions."taskId"
  AND analysis."solutionHash" = studentSolutions."solutionHash"
  AND analysis."deletedAt" IS NULL
LEFT JOIN "AuthenticatedStudent" student
  ON student."studentId" = studentSolutions."studentId"
  AND student."deletedAt" IS NULL
LEFT JOIN "SolutionTest" test
  ON test."studentSolutionId" = studentSolutions.id AND test."deletedAt" IS NULL
ORDER BY test."name" ASC
)

UNION ALL

-- select all student reference solutions from the association table
(
SELECT
  analysis.*,
  test."identifier" AS "testIdentifier",
  test."name" AS "testName",
  test."contextName" AS "testContextName",
  test."passed" AS "testPassed",
  reference."studentId" AS "studentId",
  student.pseudonym AS "studentPseudonym",
  student."keyPairId" AS "studentKeyPairId",
  true AS "isReference",
  false AS "isLatest",
  studentSolution."id" AS "studentSolutionId",
  (studentSolution."id" IS NOT NULL) AS "isStudentSolution",
  reference."sessionId" AS "sessionId",
  NULL::int AS "referenceSolutionId",
  NULL::text AS "referenceSolutionTitle",
  NULL::text AS "referenceSolutionDescription",
  NULL::boolean AS "isInitialTaskSolution"
FROM "SolutionActivityReference" reference
LEFT JOIN LATERAL (
  SELECT candidate."id"
  FROM "StudentSolution" candidate
  WHERE candidate."studentId" = reference."studentId"
    AND candidate."sessionId" = reference."sessionId"
    AND candidate."taskId" = reference."taskId"
    AND candidate."solutionHash" = reference."solutionHash"
    AND candidate."deletedAt" IS NULL
  ORDER BY candidate."createdAt" DESC
  LIMIT 1
) studentSolution ON true
LEFT JOIN LATERAL (
  SELECT candidate."id"
  FROM "StudentActivity" candidate
  WHERE candidate."studentId" = reference."studentId"
    AND candidate."sessionId" = reference."sessionId"
    AND candidate."taskId" = reference."taskId"
    AND candidate."solutionHash" = reference."solutionHash"
    AND candidate."deletedAt" IS NULL
  LIMIT 1
) studentActivity ON true
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = reference."taskId"
  AND analysis."solutionHash" = reference."solutionHash"
  AND analysis."deletedAt" IS NULL
LEFT JOIN "AuthenticatedStudent" student
  ON student."studentId" = reference."studentId"
  AND student."deletedAt" IS NULL
LEFT JOIN "SolutionTest" test
  ON test."studentSolutionId" = studentSolution."id"
  AND test."deletedAt" IS NULL
WHERE reference."sessionId" = $1
AND reference."taskId" = $2
AND (studentSolution."id" IS NOT NULL OR studentActivity."id" IS NOT NULL)
AND NOT EXISTS (
  SELECT 1 FROM studentSolutions
  WHERE studentSolutions."studentId" = reference."studentId"
    AND studentSolutions."solutionHash" = reference."solutionHash"
)

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
  false AS "isLatest",
  NULL::int AS "studentSolutionId",
  false AS "isStudentSolution",
  NULL::int AS "sessionId",
  referenceSolution."id" AS "referenceSolutionId",
  referenceSolution."title" AS "referenceSolutionTitle",
  referenceSolution."description" AS "referenceSolutionDescription",
  referenceSolution."isInitial" AS "isInitialTaskSolution"
FROM "ReferenceSolution" referenceSolution
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = referenceSolution."taskId"
  AND analysis."solutionHash" = referenceSolution."solutionHash"
  AND analysis."deletedAt" IS NULL
LEFT JOIN "SolutionTest" test
  ON test."referenceSolutionId" = referenceSolution.id
  AND test."deletedAt" IS NULL
WHERE referenceSolution."taskId" = $2
AND referenceSolution."deletedAt" IS NULL
)