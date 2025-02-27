-- CreateTable
CREATE TABLE "donation_receipt_counter" (
    "jurisdiction" "Jurisdiction" NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "donation_receipt_counter_pkey" PRIMARY KEY ("jurisdiction")
);
