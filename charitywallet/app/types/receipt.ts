// types/receipt.ts

import { DonationReceipt, Charity, Donor } from "@prisma/client";

// Import Prisma models directly (PascalCase)

/**
 * Front-end receipt DTO
 * - Drops Prisma relation fields
 * - Converts dates to ISO strings
 * - Adds human-readable and flattened properties
 */
export type ReceiptDTO = Omit<
  DonationReceipt,
  "donation_date" | "charity" | "donor"
> & {
  /** ISO-formatted donation date */
  donation_date: string;
  /** Picked charity info */
  charity: Pick<
    Charity,
    "charity_name" | "registration_number" | "charity_sends_receipt"
  > | null;
  /** Top-level charity name for UI */
  charity_name: string | null;
  /** Picked donor info */
  donor: Pick<Donor, "first_name" | "last_name" | "email"> | null;
  /** Human-readable chain name */
  chain: string | null;
  /** Transaction hash for UI display */
  transaction_hash: string;
  // forwarded USDC amount as string
  usdcSent: string | null;
};
