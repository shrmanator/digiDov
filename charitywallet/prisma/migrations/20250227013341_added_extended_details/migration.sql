-- CreateEnum
CREATE TYPE "Jurisdiction" AS ENUM ('CRA', 'IRS');

-- AlterTable
ALTER TABLE "donation_receipt" ADD COLUMN     "extended_details" JSONB,
ADD COLUMN     "jurisdiction" "Jurisdiction" NOT NULL DEFAULT 'CRA';
