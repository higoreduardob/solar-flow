/*
  Warnings:

  - A unique constraint covering the columns `[email,role,enterpriseBelongId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_email_role_enterpriseBelongId_key" ON "User"("email", "role", "enterpriseBelongId");
