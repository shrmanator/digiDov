/**
 * Convert DonationReceipt[] to CSV string
 */

import { DonationReceipt } from "@/app/types/receipt";

export function receiptsToCsv(receipts: DonationReceipt[]): string {
  if (!receipts.length) {
    return "No receipts\n";
  }
  const headers = [
    "Date",
    "Charity Name",
    "Donor Name",
    "Donor Email",
    "Fiat Amount (CAD)",
    "Crypto Amount (wei)",
    "Transaction Hash",
    "Donation ID",
  ];
  const rows = receipts.map((r) => {
    const donorName = r.donor
      ? `${r.donor.first_name} ${r.donor.last_name}`
      : "Anonymous";
    return [
      r.donation_date,
      r.charity?.charity_name ?? "",
      donorName,
      r.donor?.email ?? "",
      r.fiat_amount.toFixed(2),
      r.crypto_amount_wei,
      r.transaction_hash,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}
