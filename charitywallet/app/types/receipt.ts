import { charity, donation_receipt, donor } from "@prisma/client";

export type DonationReceipt = Omit<
  donation_receipt,
  "donation_date" | "charity" | "donor"
> & {
  donation_date: string;
  charity: Pick<
    charity,
    "charity_name" | "registration_number" | "charity_sends_receipt"
  > | null;
  donor: Pick<donor, "first_name" | "last_name" | "email"> | null;
  chain: string | null;
};
