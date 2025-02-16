-- CreateTable
CREATE TABLE "DonationReceipt" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "donationDate" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "fiatAmount" DOUBLE PRECISION NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "charityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonationReceipt_receiptNumber_key" ON "DonationReceipt"("receiptNumber");

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
