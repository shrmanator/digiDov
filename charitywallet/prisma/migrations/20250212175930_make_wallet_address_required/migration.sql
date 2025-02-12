/*
  Warnings:

  - Made the column `wallet_address` on table `Charities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Charities" ALTER COLUMN "wallet_address" SET NOT NULL;
