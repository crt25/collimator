/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[oidcSub,authenticationProvider]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authenticationProvider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oidcSub` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthenticationProvider" AS ENUM ('MICROSOFT');

-- DropIndex
DROP INDEX "User_email_key";

-- add new columns
ALTER TABLE "User"
  ADD COLUMN     "authenticationProvider" "AuthenticationProvider",
  ADD COLUMN     "oidcSub" TEXT;

-- set provider to MICROSOFT for all users
UPDATE "User" SET "authenticationProvider" = 'MICROSOFT';

-- set oidcSub to email for all users (will need to be changed manually)
UPDATE "User" SET "oidcSub" = "email";

-- drop email column
ALTER TABLE "User" DROP COLUMN "email";

-- make new columns non-nullable
ALTER TABLE "User"
  ALTER COLUMN "authenticationProvider" SET NOT NULL,
  ALTER COLUMN "oidcSub" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_oidcSub_authenticationProvider_key" ON "User"("oidcSub", "authenticationProvider");
