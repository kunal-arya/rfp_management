/*
  Warnings:

  - The primary key for the `AuditTrail` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."AuditTrail" DROP CONSTRAINT "AuditTrail_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AuditTrail_id_seq";
