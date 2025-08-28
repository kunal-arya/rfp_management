/*
  Warnings:

  - You are about to drop the column `file_path` on the `Document` table. All the data in the column will be lost.
  - Added the required column `url` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "file_path",
ADD COLUMN     "url" TEXT NOT NULL;
