/*
  Warnings:

  - You are about to drop the `Charities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DonationReceipt" DROP CONSTRAINT "DonationReceipt_charityId_fkey";

-- DropForeignKey
ALTER TABLE "DonationReceipt" DROP CONSTRAINT "DonationReceipt_donorId_fkey";

-- DropTable
DROP TABLE "Charities";

-- DropTable
DROP TABLE "Donors";

-- CreateTable
CREATE TABLE "Charity" (
    "id" TEXT NOT NULL,
    "charity_name" TEXT,
    "registered_address" TEXT,
    "registration_number" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "wallet_address" TEXT NOT NULL,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "address" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Charity_wallet_address_key" ON "Charity"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_walletAddress_key" ON "Donor"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
