-- Add isReference flag to StudentActivity so that activity-tracked solutions
ALTER TABLE "StudentActivity" ADD COLUMN "isReference" BOOLEAN NOT NULL DEFAULT false;
  