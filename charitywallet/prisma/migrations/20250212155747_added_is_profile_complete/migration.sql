/*
  Warnings:

  - You are about to drop the column `legal_name` on the `Charities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Charities" DROP COLUMN "legal_name",
ADD COLUMN     "charity_name" TEXT,
ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "registered_address" DROP NOT NULL,
ALTER COLUMN "registration_number" DROP NOT NULL,
ALTER COLUMN "contact_name" DROP NOT NULL,
ALTER COLUMN "contact_email" DROP NOT NULL,
ALTER COLUMN "contact_phone" DROP NOT NULL,
ALTER COLUMN "wallet_address" DROP NOT NULL;
