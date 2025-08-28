/*
  Warnings:

  - A unique constraint covering the columns `[awarded_response_id]` on the table `RFP` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."RFP" ADD COLUMN     "awarded_at" TIMESTAMP(3),
ADD COLUMN     "awarded_response_id" TEXT,
ADD COLUMN     "closed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."SupplierResponse" ADD COLUMN     "decided_at" TIMESTAMP(3),
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "submitted_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "RFP_awarded_response_id_key" ON "public"."RFP"("awarded_response_id");

-- AddForeignKey
ALTER TABLE "public"."RFP" ADD CONSTRAINT "RFP_awarded_response_id_fkey" FOREIGN KEY ("awarded_response_id") REFERENCES "public"."SupplierResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
