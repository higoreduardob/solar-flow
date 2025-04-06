/*
  Warnings:

  - A unique constraint covering the columns `[name,role,enterpriseId]` on the table `Equipament` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Equipament_name_role_enterpriseId_key" ON "Equipament"("name", "role", "enterpriseId");
