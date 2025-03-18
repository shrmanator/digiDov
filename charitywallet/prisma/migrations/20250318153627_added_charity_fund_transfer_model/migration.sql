-- CreateTable
CREATE TABLE "charity_fund_transfer" (
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

    CONSTRAINT "charity_fund_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charity_fund_transfer_transaction_hash_key" ON "charity_fund_transfer"("transaction_hash");

-- AddForeignKey
ALTER TABLE "charity_fund_transfer" ADD CONSTRAINT "charity_fund_transfer_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
