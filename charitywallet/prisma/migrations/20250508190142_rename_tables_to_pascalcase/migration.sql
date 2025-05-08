/*
  Warnings:

  - You are about to drop the `charity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `charity_fund_transfer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `donation_receipt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `donation_receipt_counter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `donor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "charity_fund_transfer" DROP CONSTRAINT "charity_fund_transfer_charity_id_fkey";

-- DropForeignKey
ALTER TABLE "donation_receipt" DROP CONSTRAINT "donation_receipt_charity_id_fkey";

-- DropForeignKey
ALTER TABLE "donation_receipt" DROP CONSTRAINT "donation_receipt_donor_id_fkey";

-- DropTable
DROP TABLE "charity";

-- DropTable
DROP TABLE "charity_fund_transfer";

-- DropTable
DROP TABLE "donation_receipt";

-- DropTable
DROP TABLE "donation_receipt_counter";

-- DropTable
DROP TABLE "donor";

-- CreateTable
CREATE TABLE "Charity" (
    "id" TEXT NOT NULL,
    "registered_office_address" TEXT,
    "registration_number" TEXT,
    "contact_email" TEXT,
    "wallet_address" TEXT NOT NULL,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT,
    "city" TEXT,
    "contact_last_name" TEXT,
    "contact_mobile_phone" TEXT,
    "countryCode" TEXT,
    "postCode" TEXT,
    "state" TEXT,
    "date_of_birth" TEXT,
    "charity_name" TEXT,
    "transak_stream_wallet_address" TEXT,
    "contact_first_name" TEXT,
    "contact_title" TEXT,
    "charity_sends_receipt" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharityFundTransfer" (
    "id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "amount_wei" BIGINT NOT NULL,
    "fiat_equivalent" DOUBLE PRECISION,
    "transaction_hash" TEXT NOT NULL,
    "destination_wallet" TEXT NOT NULL,
    "chain_id" TEXT,
    "gas_fee_wei" BIGINT,
    "transfer_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fiat_currency" TEXT,

    CONSTRAINT "CharityFundTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "address" TEXT,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationReceipt" (
    "id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "donation_date" TIMESTAMP(3) NOT NULL,
    "fiat_amount" DOUBLE PRECISION NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "charity_id" TEXT,
    "donor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "jurisdiction" "Jurisdiction" NOT NULL DEFAULT 'CRA',
    "jurisdiction_details" JSONB,
    "crypto_amount_wei" BIGINT,
    "chainId" TEXT,

    CONSTRAINT "DonationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationReceiptCounter" (
    "jurisdiction" "Jurisdiction" NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DonationReceiptCounter_pkey" PRIMARY KEY ("jurisdiction")
);

-- CreateIndex
CREATE UNIQUE INDEX "Charity_contact_email_key" ON "Charity"("contact_email");

-- CreateIndex
CREATE UNIQUE INDEX "Charity_wallet_address_key" ON "Charity"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "Charity_slug_key" ON "Charity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Charity_contact_mobile_phone_key" ON "Charity"("contact_mobile_phone");

-- CreateIndex
CREATE UNIQUE INDEX "Charity_transak_stream_wallet_address_key" ON "Charity"("transak_stream_wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "CharityFundTransfer_transaction_hash_key" ON "CharityFundTransfer"("transaction_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_wallet_address_key" ON "Donor"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DonationReceipt_receipt_number_key" ON "DonationReceipt"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "DonationReceipt_transaction_hash_key" ON "DonationReceipt"("transaction_hash");

-- AddForeignKey
ALTER TABLE "CharityFundTransfer" ADD CONSTRAINT "CharityFundTransfer_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "Charity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "Charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
