/*
  Warnings:

  - A unique constraint covering the columns `[oidcSub,authenticationProvider]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authenticationProvider` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "RegistrationToken" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RegistrationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationToken_token_key" ON "RegistrationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationToken_userId_key" ON "RegistrationToken"("userId");

-- AddForeignKey
ALTER TABLE "RegistrationToken" ADD CONSTRAINT "RegistrationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "AuthenticationProvider" AS ENUM ('MICROSOFT');

-- DropIndex
DROP INDEX "User_email_key";

-- add new columns
ALTER TABLE "User"
  ADD COLUMN     "authenticationProvider" "AuthenticationProvider",
  ADD COLUMN     "oidcSub" TEXT;

-- set provider to MICROSOFT for all users
UPDATE "User" SET "authenticationProvider" = 'MICROSOFT';

-- make new columns non-nullable
ALTER TABLE "User" ALTER COLUMN "authenticationProvider" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_oidcSub_authenticationProvider_key" ON "User"("oidcSub", "authenticationProvider");
CREATE UNIQUE INDEX "User_email_authenticationProvider_key" ON "User"("email", "authenticationProvider");
