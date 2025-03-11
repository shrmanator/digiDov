/*
  Warnings:

  - You are about to drop the column `charity_first_name` on the `charity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "charity" DROP COLUMN "charity_first_name",
ADD COLUMN     "charity_name" TEXT;
