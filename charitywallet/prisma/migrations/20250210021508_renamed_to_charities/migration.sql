/*
  Warnings:

  - You are about to drop the `Charity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Charity";

-- CreateTable
CREATE TABLE "Charities" (
    "id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "registered_address" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Charities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Charities_wallet_address_key" ON "Charities"("wallet_address");
