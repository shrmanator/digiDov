/*
  Warnings:

  - You are about to drop the `Donor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DonationReceipt" DROP CONSTRAINT "DonationReceipt_donorId_fkey";

-- DropTable
DROP TABLE "Donor";

-- CreateTable
CREATE TABLE "Donors" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donors_walletAddress_key" ON "Donors"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Donors_email_key" ON "Donors"("email");

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
