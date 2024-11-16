/*
  Warnings:

  - A unique constraint covering the columns `[pseudonym,classId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `pseudonym` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Student_pseudonym_key";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "keyPairId" INTEGER,
DROP COLUMN "pseudonym",
ADD COLUMN     "pseudonym" BYTEA NOT NULL;

-- CreateTable
CREATE TABLE "KeyPair" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "publicKeyFingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salt" BYTEA NOT NULL,

    CONSTRAINT "KeyPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncryptedPrivateKey" (
    "id" SERIAL NOT NULL,
    "publicKeyId" INTEGER NOT NULL,
    "encryptedPrivateKey" BYTEA NOT NULL,
    "salt" BYTEA NOT NULL,

    CONSTRAINT "EncryptedPrivateKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthenticationToken" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER,
    "studentId" INTEGER,

    CONSTRAINT "AuthenticationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeyPair_teacherId_key" ON "KeyPair"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "KeyPair_publicKeyFingerprint_key" ON "KeyPair"("publicKeyFingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "AuthenticationToken_token_key" ON "AuthenticationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Student_pseudonym_classId_key" ON "Student"("pseudonym", "classId");

-- AddForeignKey
ALTER TABLE "KeyPair" ADD CONSTRAINT "KeyPair_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncryptedPrivateKey" ADD CONSTRAINT "EncryptedPrivateKey_publicKeyId_fkey" FOREIGN KEY ("publicKeyId") REFERENCES "KeyPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_keyPairId_fkey" FOREIGN KEY ("keyPairId") REFERENCES "KeyPair"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticationToken" ADD CONSTRAINT "AuthenticationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticationToken" ADD CONSTRAINT "AuthenticationToken_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
