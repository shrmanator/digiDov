-- DropForeignKey
ALTER TABLE "charity_fund_transfer" DROP CONSTRAINT "charity_fund_transfer_charity_id_fkey";

-- AddForeignKey
ALTER TABLE "charity_fund_transfer" ADD CONSTRAINT "charity_fund_transfer_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
