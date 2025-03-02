import { charity, donation_receipt, donor } from "@prisma/client";

// Extend Prisma's type to match frontend needs
export type DonationReceipt = Omit<
  donation_receipt,
  "donation_date" | "charity" | "donor"
> & {
  donation_date: string; // Convert from Date to string for frontend compatibility
  charity: Pick<charity, "charity_name" | "registration_number"> | null;
  donor: Pick<donor, "first_name" | "last_name" | "email"> | null;
};
