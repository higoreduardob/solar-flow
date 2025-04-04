/*
  Warnings:

  - A unique constraint covering the columns `[name,enterpriseId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,enterpriseId]` on the table `Measure` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "selectedEnterprise" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_enterpriseId_key" ON "Category"("name", "enterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "Measure_name_enterpriseId_key" ON "Measure"("name", "enterpriseId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedEnterprise_fkey" FOREIGN KEY ("selectedEnterprise") REFERENCES "Enterprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
