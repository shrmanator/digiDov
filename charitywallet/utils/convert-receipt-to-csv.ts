// app/utils/receiptsToCsv.ts
import { DonationReceipt } from "@/app/types/receipt";

/**
 * Convert DonationReceipt[] to CSV string with full financial breakdown.
 */
export function receiptsToCsv(receipts: DonationReceipt[]): string {
  if (!receipts.length) {
    return "No receipts\n";
  }

  const headers = [
    "Donation Date",
    "Receipt Number",
    "Donation ID",
    "Charity Name",
    "Donor Name",
    "Donor Email",
    "Blockchain",
    "Transaction Hash",
    "Gross Amount (CAD)",
    "Platform Fee (3%)",
    "Net Amount to Charity (CAD)",
    "Crypto Amount (wei)",
  ];

  const rows = receipts.map((r) => {
    const donorName = r.donor
      ? `${r.donor.first_name ?? ""} ${r.donor.last_name ?? ""}`.trim()
      : "Anonymous";

    const gross = r.fiat_amount;
    const fee = +(gross * 0.03).toFixed(2);
    const net = +(gross - fee).toFixed(2);

    const cells = [
      r.donation_date,
      r.receipt_number,
      r.id,
      r.charity_name ?? r.charity?.charity_name ?? "",
      donorName,
      r.donor?.email ?? "",
      r.chain ?? "",
      r.transaction_hash,
      gross.toFixed(2),
      fee.toFixed(2),
      net.toFixed(2),
      r.crypto_amount_wei?.toString() ?? "",
    ];

    // Escape quotes and wrap each cell in double quotes
    return cells
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}
