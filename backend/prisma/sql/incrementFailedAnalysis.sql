-- @param {Int} $1:taskId The taskId of the solution whose tries are to be increased by one.
-- @param {Bytes} $2:solutionHash The hash of the solution whose tries are to be increased by one.
UPDATE "Solution" AS solution
SET "failedAnalyses" = "failedAnalyses" + 1
WHERE solution."taskId" = $1
AND   solution."hash"   = $2