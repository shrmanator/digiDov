/*
  Warnings:

  - You are about to drop the column `contact_name` on the `charity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "charity" DROP COLUMN "contact_name",
ADD COLUMN     "contact_first_name" TEXT;
