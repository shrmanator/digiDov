/*
  Warnings:

  - A unique constraint covering the columns `[transak_stream_wallet_address]` on the table `charity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "charity" ADD COLUMN     "transak_stream_wallet_address" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "charity_transak_stream_wallet_address_key" ON "charity"("transak_stream_wallet_address");
