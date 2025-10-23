-- AlterTable
ALTER TABLE "AuthenticationToken" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RegistrationToken" ADD COLUMN     "deletedAt" TIMESTAMP(3);
