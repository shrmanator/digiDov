/*
  Warnings:

  - You are about to drop the column `charity_name` on the `charity` table. All the data in the column will be lost.
  - You are about to drop the column `contact_name` on the `charity` table. All the data in the column will be lost.
  - You are about to drop the column `contact_phone` on the `charity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "charity" DROP COLUMN "charity_name",
DROP COLUMN "contact_name",
DROP COLUMN "contact_phone",
ADD COLUMN     "charity_first_name" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contact_first_name" TEXT,
ADD COLUMN     "contact_last_name" TEXT,
ADD COLUMN     "contact_mobile_phone" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "postCode" TEXT,
ADD COLUMN     "state" TEXT;
