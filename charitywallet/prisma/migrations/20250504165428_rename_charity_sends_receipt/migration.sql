/*
  Warnings:

  - You are about to drop the column `manual_receipt` on the `charity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "charity" DROP COLUMN "manual_receipt",
ADD COLUMN     "charity_sends_receipt" BOOLEAN NOT NULL DEFAULT false;
