-- CreateEnum
CREATE TYPE "EquipamentRole" AS ENUM ('PLATE', 'INVERTER');

-- CreateTable
CREATE TABLE "Equipament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "power" INTEGER NOT NULL,
    "role" "EquipamentRole" NOT NULL DEFAULT 'PLATE',
    "sales" INTEGER NOT NULL DEFAULT 0,
    "obs" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "voc" INTEGER,
    "isc" INTEGER,
    "vmp" INTEGER,
    "imp" INTEGER,
    "circuitBreaker" INTEGER,
    "mppt" INTEGER,
    "quantityString" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "inmetroId" TEXT,
    "datasheetId" TEXT,

    CONSTRAINT "Equipament_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipament_inmetroId_key" ON "Equipament"("inmetroId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipament_datasheetId_key" ON "Equipament"("datasheetId");

-- AddForeignKey
ALTER TABLE "Equipament" ADD CONSTRAINT "Equipament_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipament" ADD CONSTRAINT "Equipament_inmetroId_fkey" FOREIGN KEY ("inmetroId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipament" ADD CONSTRAINT "Equipament_datasheetId_fkey" FOREIGN KEY ("datasheetId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
