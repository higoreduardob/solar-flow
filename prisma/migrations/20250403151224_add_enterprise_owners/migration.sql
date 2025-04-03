/*
  Warnings:

  - You are about to drop the column `enterpriseOwnerId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_enterpriseOwnerId_fkey";

-- DropIndex
DROP INDEX "User_email_enterpriseOwnerId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "enterpriseOwnerId";

-- CreateTable
CREATE TABLE "EnterpriseOwner" (
    "userId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,

    CONSTRAINT "EnterpriseOwner_pkey" PRIMARY KEY ("userId","enterpriseId")
);

-- AddForeignKey
ALTER TABLE "EnterpriseOwner" ADD CONSTRAINT "EnterpriseOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseOwner" ADD CONSTRAINT "EnterpriseOwner_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
