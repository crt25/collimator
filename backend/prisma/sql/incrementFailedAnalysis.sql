-- @param {Int} $1:solutionId The id of the solution whose tries are to be increased by one.
UPDATE "Solution" AS solution
SET "failedAnalyses" = "failedAnalyses" + 1
WHERE solution."id" = $1