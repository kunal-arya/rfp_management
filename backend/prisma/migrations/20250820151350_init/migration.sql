-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('Buyer', 'Supplier');

-- CreateEnum
CREATE TYPE "public"."RFPStatus" AS ENUM ('Draft', 'Published', 'Under_Review', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RFP" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."RFPStatus" NOT NULL DEFAULT 'Draft',
    "buyer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RFPVersion" (
    "id" TEXT NOT NULL,
    "rfp_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "form_data" JSONB NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rfp_link_id" TEXT,

    CONSTRAINT "RFPVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupplierResponse" (
    "id" TEXT NOT NULL,
    "rfp_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "response_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploader_id" TEXT NOT NULL,
    "rfp_response_id" TEXT,
    "parent_document_id" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditTrail" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RFPVersion_rfp_link_id_key" ON "public"."RFPVersion"("rfp_link_id");

-- AddForeignKey
ALTER TABLE "public"."RFP" ADD CONSTRAINT "RFP_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RFPVersion" ADD CONSTRAINT "RFPVersion_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."RFP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RFPVersion" ADD CONSTRAINT "RFPVersion_rfp_link_id_fkey" FOREIGN KEY ("rfp_link_id") REFERENCES "public"."RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplierResponse" ADD CONSTRAINT "SupplierResponse_rfp_id_fkey" FOREIGN KEY ("rfp_id") REFERENCES "public"."RFP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplierResponse" ADD CONSTRAINT "SupplierResponse_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_rfp_response_id_fkey" FOREIGN KEY ("rfp_response_id") REFERENCES "public"."SupplierResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_parent_document_id_fkey" FOREIGN KEY ("parent_document_id") REFERENCES "public"."Document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."AuditTrail" ADD CONSTRAINT "AuditTrail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
