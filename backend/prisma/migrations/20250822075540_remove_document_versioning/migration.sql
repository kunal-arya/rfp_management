/*
  Warnings:

  - You are about to drop the column `parent_document_id` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Document` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_parent_document_id_fkey";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "parent_document_id",
DROP COLUMN "version";
