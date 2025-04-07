/*
  Warnings:

  - Made the column `responsibleId` on table `Work` required. This step will fail if there are existing NULL values in that column.
  - Made the column `designerId` on table `Work` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Work" ALTER COLUMN "xLat" SET DATA TYPE TEXT,
ALTER COLUMN "yLat" SET DATA TYPE TEXT,
ALTER COLUMN "lat" SET DATA TYPE TEXT,
ALTER COLUMN "long" SET DATA TYPE TEXT,
ALTER COLUMN "responsibleId" SET NOT NULL,
ALTER COLUMN "designerId" SET NOT NULL;
