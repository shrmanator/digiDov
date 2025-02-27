/*
  Warnings:

  - You are about to drop the column `extended_details` on the `donation_receipt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "donation_receipt" DROP COLUMN "extended_details",
ADD COLUMN     "jurisdiction_details" JSONB;
