/*
  Warnings:

  - The `status` column on the `Work` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WorkRole" AS ENUM ('INPROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "role" "WorkRole" NOT NULL DEFAULT 'INPROGRESS',
DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "WorkStatus";
