/*
  Warnings:

  - A unique constraint covering the columns `[transaction_hash]` on the table `donation_receipt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "donation_receipt_transaction_hash_key" ON "donation_receipt"("transaction_hash");
