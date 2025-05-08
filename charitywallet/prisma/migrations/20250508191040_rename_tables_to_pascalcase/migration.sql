/*
  Warnings:

  - You are about to drop the `Charity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CharityFundTransfer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DonationReceipt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DonationReceiptCounter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CharityFundTransfer" DROP CONSTRAINT "CharityFundTransfer_charity_id_fkey";

-- DropForeignKey
ALTER TABLE "DonationReceipt" DROP CONSTRAINT "DonationReceipt_charity_id_fkey";

-- DropForeignKey
ALTER TABLE "DonationReceipt" DROP CONSTRAINT "DonationReceipt_donor_id_fkey";

-- DropTable
DROP TABLE "Charity";

-- DropTable
DROP TABLE "CharityFundTransfer";

-- DropTable
DROP TABLE "DonationReceipt";

-- DropTable
DROP TABLE "DonationReceiptCounter";

-- DropTable
DROP TABLE "Donor";

-- CreateTable
CREATE TABLE "charity" (
    "id" TEXT NOT NULL,
    "charity_name" TEXT,
    "registration_number" TEXT,
    "contact_title" TEXT,
    "contact_first_name" TEXT,
    "contact_last_name" TEXT,
    "contact_email" TEXT,
    "contact_mobile_phone" TEXT,
    "charity_sends_receipt" BOOLEAN NOT NULL DEFAULT false,
    "registered_office_address" TEXT,
    "date_of_birth" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postCode" TEXT,
    "countryCode" TEXT,
    "wallet_address" TEXT NOT NULL,
    "transak_stream_wallet_address" TEXT,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charity_fund_transfer" (
    "id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "amount_wei" BIGINT NOT NULL,
    "fiat_equivalent" DOUBLE PRECISION,
    "fiat_currency" TEXT,
    "transaction_hash" TEXT NOT NULL,
    "destination_wallet" TEXT NOT NULL,
    "chain_id" TEXT,
    "gas_fee_wei" BIGINT,
    "transfer_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charity_fund_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donor" (
    "id" TEXT NOT NULL,
    "title" TEXT,
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
    "crypto_amount_wei" BIGINT,
    "transaction_hash" TEXT NOT NULL,
    "chainId" TEXT,
    "jurisdiction" "Jurisdiction" NOT NULL DEFAULT 'CRA',
    "jurisdiction_details" JSONB,
    "charity_id" TEXT,
    "donor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_receipt_counter" (
    "jurisdiction" "Jurisdiction" NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "donation_receipt_counter_pkey" PRIMARY KEY ("jurisdiction")
);

-- CreateIndex
CREATE UNIQUE INDEX "charity_contact_email_key" ON "charity"("contact_email");

-- CreateIndex
CREATE UNIQUE INDEX "charity_contact_mobile_phone_key" ON "charity"("contact_mobile_phone");

-- CreateIndex
CREATE UNIQUE INDEX "charity_wallet_address_key" ON "charity"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "charity_transak_stream_wallet_address_key" ON "charity"("transak_stream_wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "charity_slug_key" ON "charity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "charity_fund_transfer_transaction_hash_key" ON "charity_fund_transfer"("transaction_hash");

-- CreateIndex
CREATE UNIQUE INDEX "donor_wallet_address_key" ON "donor"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "donor_email_key" ON "donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "donation_receipt_receipt_number_key" ON "donation_receipt"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "donation_receipt_transaction_hash_key" ON "donation_receipt"("transaction_hash");

-- AddForeignKey
ALTER TABLE "charity_fund_transfer" ADD CONSTRAINT "charity_fund_transfer_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_receipt" ADD CONSTRAINT "donation_receipt_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_receipt" ADD CONSTRAINT "donation_receipt_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
