-- Create tables
CREATE TABLE "AuthenticatedStudent" (
    "studentId" INTEGER NOT NULL,
    "pseudonym" BYTEA NOT NULL,
    "classId" INTEGER NOT NULL,
    "keyPairId" INTEGER,

    CONSTRAINT "AuthenticatedStudent_pkey" PRIMARY KEY ("studentId")
);

CREATE TABLE "AnonymousStudent" (
    "studentId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "AnonymousStudent_pkey" PRIMARY KEY ("studentId")
);

-- Create indices
CREATE UNIQUE INDEX "AuthenticatedStudent_pseudonym_classId_key" ON "AuthenticatedStudent"("pseudonym", "classId");

-- Add foreign key
ALTER TABLE "AuthenticatedStudent" ADD CONSTRAINT "AuthenticatedStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthenticatedStudent" ADD CONSTRAINT "AuthenticatedStudent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuthenticatedStudent" ADD CONSTRAINT "AuthenticatedStudent_keyPairId_fkey" FOREIGN KEY ("keyPairId") REFERENCES "KeyPair"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnonymousStudent" ADD CONSTRAINT "AnonymousStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnonymousStudent" ADD CONSTRAINT "AnonymousStudent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate data 
-- NOTE: We treat all existing students as authenticated because we cannot determine
-- whether they are anonymous as this information is stored encrypted within the pseudonym.
-- This will cause decryption to fail for anonymous students but since the system has not been
-- used in production yet, we can manually fix existing test data on request.
INSERT INTO "AuthenticatedStudent" ("studentId", "pseudonym", "classId", "keyPairId")
SELECT "id", "pseudonym", "classId", "keyPairId" FROM "Student";

-- Drop foreign keys
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";
ALTER TABLE "Student" DROP CONSTRAINT "Student_keyPairId_fkey";

-- DropIndex
DROP INDEX "Student_pseudonym_classId_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "classId",
DROP COLUMN "keyPairId",
DROP COLUMN "pseudonym";
