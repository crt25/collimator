-- Add deletedAt to SessionTask for soft-delete cascade support
-- SessionTask is now soft-deletable, cascading from Session deletion

-- Add deletedAt column
ALTER TABLE "SessionTask" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Change SessionTask foreign key from CASCADE to RESTRICT
-- Soft-delete extension will handle the cascade now instead of DB-level cascade
ALTER TABLE "SessionTask" DROP CONSTRAINT "SessionTask_sessionId_fkey";
ALTER TABLE "SessionTask" ADD CONSTRAINT "SessionTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
