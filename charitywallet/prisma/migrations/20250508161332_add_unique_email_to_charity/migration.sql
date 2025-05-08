/*
  Warnings:

  - A unique constraint covering the columns `[contact_mobile_phone]` on the table `charity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "charity_contact_mobile_phone_key" ON "charity"("contact_mobile_phone");
