/*
  Warnings:

  - A unique constraint covering the columns `[contact_email]` on the table `charity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "charity_contact_email_key" ON "charity"("contact_email");
