-- AlterTable
ALTER TABLE "charity" ADD COLUMN     "kycCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kycCompletedAt" TIMESTAMP(3);
