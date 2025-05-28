/*
  Warnings:

  - A unique constraint covering the columns `[tx_wallet_address]` on the table `charity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "charity" ADD COLUMN     "tx_wallet_address" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "charity_tx_wallet_address_key" ON "charity"("tx_wallet_address");
