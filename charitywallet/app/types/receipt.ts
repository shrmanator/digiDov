import { charity, donation_receipt, donor } from "@prisma/client";

export type DonationReceipt = Omit<
  donation_receipt,
  "donation_date" | "charity" | "donor"
> & {
  donation_date: string;
  // keep the nested charity object for the other fields
  charity: Pick<
    charity,
    "charity_name" | "registration_number" | "charity_sends_receipt"
  > | null;
  charity_name: string | null;
  donor: Pick<donor, "first_name" | "last_name" | "email"> | null;
  chain: string | null;
};
