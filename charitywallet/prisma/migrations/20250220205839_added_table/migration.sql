/*
  Warnings:

  - You are about to drop the `Charity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DonationReceipt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DonationReceipt" DROP CONSTRAINT "DonationReceipt_charityId_fkey";

-- DropForeignKey
ALTER TABLE "DonationReceipt" DROP CONSTRAINT "DonationReceipt_donorId_fkey";

-- DropTable
DROP TABLE "Charity";

-- DropTable
DROP TABLE "DonationReceipt";

-- DropTable
DROP TABLE "Donor";

-- CreateTable
CREATE TABLE "charity" (
    "id" TEXT NOT NULL,
    "charity_name" TEXT,
    "registered_office_address" TEXT,
    "registration_number" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "wallet_address" TEXT NOT NULL,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donor" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "address" TEXT,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_receipt" (
    "id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "donation_date" TIMESTAMP(3) NOT NULL,
    "fiat_amount" DOUBLE PRECISION NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "charity_id" TEXT,
    "donor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charity_wallet_address_key" ON "charity"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "donor_wallet_address_key" ON "donor"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "donor_email_key" ON "donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "donation_receipt_receipt_number_key" ON "donation_receipt"("receipt_number");

-- AddForeignKey
ALTER TABLE "donation_receipt" ADD CONSTRAINT "donation_receipt_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_receipt" ADD CONSTRAINT "donation_receipt_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
