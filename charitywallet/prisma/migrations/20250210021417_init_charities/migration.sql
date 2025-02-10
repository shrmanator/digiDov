-- CreateTable
CREATE TABLE "Charity" (
    "id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "registered_address" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Charity_wallet_address_key" ON "Charity"("wallet_address");
