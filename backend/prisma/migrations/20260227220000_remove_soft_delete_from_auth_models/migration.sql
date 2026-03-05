-- Remove soft-delete (deletedAt) from auth models and change to hard-delete cascade
-- Auth tokens and key pairs should be permanently deleted when their parent is deleted
-- They don't benefit from soft-delete recovery and should be purged for security

-- Step 1: Drop deletedAt columns from auth models
ALTER TABLE "KeyPair" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "EncryptedPrivateKey" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "RegistrationToken" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "AuthenticationToken" DROP COLUMN IF EXISTS "deletedAt";

-- Step 2: Change KeyPair foreign key from RESTRICT to CASCADE
-- When a User is deleted, their KeyPair should be hard-deleted
ALTER TABLE "KeyPair" DROP CONSTRAINT "KeyPair_teacherId_fkey";
ALTER TABLE "KeyPair" ADD CONSTRAINT "KeyPair_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 3: Change EncryptedPrivateKey foreign key from RESTRICT to CASCADE
-- When a KeyPair is deleted, its EncryptedPrivateKeys should be hard-deleted
ALTER TABLE "EncryptedPrivateKey" DROP CONSTRAINT "EncryptedPrivateKey_publicKeyId_fkey";
ALTER TABLE "EncryptedPrivateKey" ADD CONSTRAINT "EncryptedPrivateKey_publicKeyId_fkey" FOREIGN KEY ("publicKeyId") REFERENCES "KeyPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;
