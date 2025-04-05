-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_documentId_fkey";

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
