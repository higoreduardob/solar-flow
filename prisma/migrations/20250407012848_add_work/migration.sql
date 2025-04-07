/*
  Warnings:

  - A unique constraint covering the columns `[workId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('INPROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "workId" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "workId" TEXT;

-- CreateTable
CREATE TABLE "WorkTeam" (
    "workId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkTeam_pkey" PRIMARY KEY ("workId","teamId")
);

-- CreateTable
CREATE TABLE "WorkMaterial" (
    "workId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WorkEquipament" (
    "workId" TEXT NOT NULL,
    "equipamentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "cod" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "circuitBreaker" INTEGER,
    "uc" TEXT,
    "isAddressCustomer" BOOLEAN NOT NULL DEFAULT true,
    "coordinates" TEXT,
    "xLat" INTEGER,
    "yLat" INTEGER,
    "lat" INTEGER,
    "long" INTEGER,
    "obs" TEXT,
    "status" "WorkStatus" NOT NULL DEFAULT 'INPROGRESS',
    "orderDate" TIMESTAMP(3),
    "equipamentArrivalDate" TIMESTAMP(3),
    "startDateOfWork" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "responsibleId" TEXT,
    "designerId" TEXT,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkMaterial_workId_materialId_key" ON "WorkMaterial"("workId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkEquipament_workId_equipamentId_key" ON "WorkEquipament"("workId", "equipamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_workId_key" ON "Address"("workId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTeam" ADD CONSTRAINT "WorkTeam_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTeam" ADD CONSTRAINT "WorkTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkMaterial" ADD CONSTRAINT "WorkMaterial_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkMaterial" ADD CONSTRAINT "WorkMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkEquipament" ADD CONSTRAINT "WorkEquipament_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkEquipament" ADD CONSTRAINT "WorkEquipament_equipamentId_fkey" FOREIGN KEY ("equipamentId") REFERENCES "Equipament"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
