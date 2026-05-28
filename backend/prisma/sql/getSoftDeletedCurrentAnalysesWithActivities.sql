-- @param {Int} $1:sessionId The id of the session for which the analysis are to be retrieved
-- @param {Int} $2:taskId The id of the task for which the analysis are to be retrieved
(
WITH allStudentSolutions AS (
    -- solutions submitted via the student solution endpoint
    SELECT
      studentSolution."studentId",
      studentSolution."sessionId",
      studentSolution."taskId",
      studentSolution."solutionHash",
      studentSolution."createdAt",
      studentSolution."id" AS "studentSolutionId",
      studentSolution."isReference"
    FROM "StudentSolution" studentSolution
    WHERE studentSolution."sessionId" = $1
    AND studentSolution."taskId" = $2
    AND studentSolution."deletedAt" IS NOT NULL

    UNION ALL

    -- solutions submitted via student activity tracking
    SELECT
      studentActivity."studentId",
      studentActivity."sessionId",
      studentActivity."taskId",
      studentActivity."solutionHash",
      studentActivity."createdAt",
      NULL::int AS "studentSolutionId",
      false AS "isReference"
    FROM "StudentActivity" studentActivity
    WHERE studentActivity."sessionId" = $1
    AND studentActivity."taskId" = $2
    AND studentActivity."deletedAt" IS NOT NULL
  ),
  studentSolutions AS (
    SELECT DISTINCT ON (allStudentSolutions."studentId")
    allStudentSolutions.*
    FROM allStudentSolutions
    INNER JOIN "SolutionAnalysis" analysis
      ON  analysis."taskId"       = allStudentSolutions."taskId"
      AND analysis."solutionHash" = allStudentSolutions."solutionHash"
    AND analysis."deletedAt" IS NOT NULL
    ORDER BY
      allStudentSolutions."studentId",
      allStudentSolutions."createdAt" DESC
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
  studentSolutions."studentSolutionId" AS "studentSolutionId",
  (studentSolutions."studentSolutionId" IS NOT NULL) AS "isStudentSolution",
  studentSolutions."sessionId" AS "sessionId",
  NULL::int AS "referenceSolutionId",
  NULL::text AS "referenceSolutionTitle",
  NULL::text AS "referenceSolutionDescription",
  NULL::boolean AS "isInitialTaskSolution"
FROM studentSolutions
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = studentSolutions."taskId"
  AND analysis."solutionHash" = studentSolutions."solutionHash"
  AND analysis."deletedAt" IS NOT NULL
LEFT JOIN "AuthenticatedStudent" student
  ON student."studentId" = studentSolutions."studentId"
  AND student."deletedAt" IS NOT NULL
LEFT JOIN "SolutionTest" test
  ON test."studentSolutionId" = studentSolutions."studentSolutionId" AND test."deletedAt" IS NOT NULL
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
  true AS "isStudentSolution",
  studentSolution."sessionId" AS "sessionId",
  NULL::int AS "referenceSolutionId",
  NULL::text AS "referenceSolutionTitle",
  NULL::text AS "referenceSolutionDescription",
  NULL::boolean AS "isInitialTaskSolution"
FROM "StudentSolution" studentSolution
INNER JOIN "SolutionAnalysis" analysis
  ON  analysis."taskId"       = studentSolution."taskId"
  AND analysis."solutionHash" = studentSolution."solutionHash"
  AND analysis."deletedAt" IS NOT NULL
LEFT JOIN "AuthenticatedStudent" student
  ON student."studentId" = studentSolution."studentId"
  AND student."deletedAt" IS NOT NULL
LEFT JOIN "SolutionTest" test
  ON test."studentSolutionId" = studentSolution.id AND test."deletedAt" IS NOT NULL
WHERE studentSolution."sessionId" = $1
AND studentSolution."taskId" = $2
AND studentSolution."isReference" = true
AND studentSolution."deletedAt" IS NOT NULL

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
  AND "analysis"."deletedAt" IS NOT NULL
LEFT JOIN "SolutionTest" test
  ON test."referenceSolutionId" = referenceSolution.id AND test."deletedAt" IS NOT NULL
WHERE referenceSolution."taskId" = $2
AND referenceSolution."deletedAt" IS NOT NULL
);