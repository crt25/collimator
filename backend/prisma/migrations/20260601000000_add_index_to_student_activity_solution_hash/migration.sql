-- Add index on solutionHash in StudentActivity to fix transaction timeouts
CREATE INDEX "StudentActivity_solutionHash_idx" ON "StudentActivity"("solutionHash");
