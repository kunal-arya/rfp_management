/*
  Warnings:

  - You are about to drop the column `status` on the `RFP` table. All the data in the column will be lost.
  - You are about to drop the column `form_data` on the `RFPVersion` table. All the data in the column will be lost.
  - You are about to drop the column `rfp_link_id` on the `RFPVersion` table. All the data in the column will be lost.
  - You are about to drop the column `response_data` on the `SupplierResponse` table. All the data in the column will be lost.
  - Added the required column `status_id` to the `RFP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `RFPVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `RFPVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirements` to the `RFPVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `SupplierResponse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."RFPVersion" DROP CONSTRAINT "RFPVersion_rfp_link_id_fkey";

-- DropIndex
DROP INDEX "public"."RFPVersion_rfp_link_id_key";

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "rfp_version_id" TEXT;

-- AlterTable
ALTER TABLE "public"."RFP" DROP COLUMN "status",
ADD COLUMN     "status_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."RFPVersion" DROP COLUMN "form_data",
DROP COLUMN "rfp_link_id",
ADD COLUMN     "budget_max" DOUBLE PRECISION,
ADD COLUMN     "budget_min" DOUBLE PRECISION,
ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "requirements" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SupplierResponse" DROP COLUMN "response_data",
ADD COLUMN     "cover_letter" TEXT,
ADD COLUMN     "proposed_budget" DOUBLE PRECISION,
ADD COLUMN     "status_id" TEXT NOT NULL,
ADD COLUMN     "timeline" TEXT;

-- DropEnum
DROP TYPE "public"."RFPStatus";

-- CreateTable
CREATE TABLE "public"."RFPStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "RFPStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupplierResponseStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "SupplierResponseStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template_code" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RFPStatus_code_key" ON "public"."RFPStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierResponseStatus_code_key" ON "public"."SupplierResponseStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_code_key" ON "public"."NotificationTemplate"("code");

-- AddForeignKey
ALTER TABLE "public"."RFP" ADD CONSTRAINT "RFP_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."RFPStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_rfp_version_id_fkey" FOREIGN KEY ("rfp_version_id") REFERENCES "public"."RFPVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplierResponse" ADD CONSTRAINT "SupplierResponse_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."SupplierResponseStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_template_code_fkey" FOREIGN KEY ("template_code") REFERENCES "public"."NotificationTemplate"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
