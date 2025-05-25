import { charity, donation_receipt, donor } from "@prisma/client";

/**
 * Front-end DonationReceipt shape:
 * - Drop Prisma’s Date/Relation fields
 * - Add ISO date string, human-readable chain, top-level charity_name, and USDC forwarded
 */
export type DonationReceiptDto = Omit<
  donation_receipt,
  "donation_date" | "charity" | "donor" | "usdc_sent"
> & {
  donation_date: string; // ISO string
  charity: Pick<
    charity,
    "charity_name" | "registration_number" | "charity_sends_receipt"
  > | null;
  charity_name: string | null; // top-level name
  donor: Pick<donor, "first_name" | "last_name" | "email"> | null;
  chain: string | null; // human-readable chain
  transaction_hash: string; // for UI copy/truncate
  usdcSent: string | null; // forwarded USDC amount as string
};
