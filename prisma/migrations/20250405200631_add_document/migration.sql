/*
  Warnings:

  - A unique constraint covering the columns `[documentId]` on the table `Material` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "documentId" TEXT;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Material_documentId_key" ON "Material"("documentId");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
