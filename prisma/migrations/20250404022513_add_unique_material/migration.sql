/*
  Warnings:

  - A unique constraint covering the columns `[name,enterpriseId]` on the table `Material` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Material_name_enterpriseId_key" ON "Material"("name", "enterpriseId");
