/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `charity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "charity" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "charity_slug_key" ON "charity"("slug");
