/*
  Warnings:

  - A unique constraint covering the columns `[current_version_id]` on the table `RFP` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."RFP" ADD COLUMN     "current_version_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RFP_current_version_id_key" ON "public"."RFP"("current_version_id");

-- AddForeignKey
ALTER TABLE "public"."RFP" ADD CONSTRAINT "RFP_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "public"."RFPVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
