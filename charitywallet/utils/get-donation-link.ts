export function getDonationLink(charitySlug: string): string {
  const baseDonationUrl = process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS;
  if (!baseDonationUrl) {
    throw new Error(
      "Donation page address is not defined in environment variables."
    );
  }
  return `${baseDonationUrl}/${charitySlug}`;
}
