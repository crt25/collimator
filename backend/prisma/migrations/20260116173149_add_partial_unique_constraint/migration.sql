-- AlterTable
ALTER TABLE "EncryptedPrivateKey" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "KeyPair" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- Migrate data
-- NOTE: This migration implements partial unique indexes for soft delete support.
-- These indexes enforce uniqueness on non-deleted records, this allows us to soft-delete records and later create new records with the same unique values.
-- Prisma doesn't natively support partial indexes, so this is done via raw SQL.
-- DO NOT modify these indexes through Prisma schema, they must remain partial indexes.


DROP INDEX IF EXISTS "User_oidcSub_authenticationProvider_key";
DROP INDEX IF EXISTS "User_email_authenticationProvider_key";
DROP INDEX IF EXISTS "KeyPair_publicKeyFingerprint_key";
DROP INDEX IF EXISTS "KeyPair_teacherId_key";
DROP INDEX IF EXISTS "RegistrationToken_token_key";
DROP INDEX IF EXISTS "RegistrationToken_userId_key";
DROP INDEX IF EXISTS "AuthenticationToken_token_key";
DROP INDEX IF EXISTS "AuthenticatedStudent_pseudonym_classId_key";

CREATE UNIQUE INDEX "User_oidcSub_authenticationProvider_key"
ON "User"("oidcSub", "authenticationProvider") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "User_email_authenticationProvider_key"
ON "User"("email", "authenticationProvider") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "KeyPair_publicKeyFingerprint_key"
ON "KeyPair"("publicKeyFingerprint") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "KeyPair_teacherId_key"
ON "KeyPair"("teacherId") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "RegistrationToken_token_key"
ON "RegistrationToken"("token") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "RegistrationToken_userId_key"
ON "RegistrationToken"("userId") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "AuthenticationToken_token_key"
ON "AuthenticationToken"("token") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "AuthenticatedStudent_pseudonym_classId_key"
ON "AuthenticatedStudent"("pseudonym", "classId") 
WHERE "deletedAt" IS NULL;
