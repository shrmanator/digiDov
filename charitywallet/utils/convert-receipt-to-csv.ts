// app/utils/receiptsToCsv.ts
import { DonationReceipt } from "@/app/types/receipt";
import { chainIdToName } from "./chainid-to-name";
import { weiToEvm } from "./convert-wei-to-evm";

/**
 * Convert DonationReceipt[] to CSV string with full financial breakdown.
 */
export function receiptsToCsv(receipts: DonationReceipt[]): string {
  if (!receipts.length) {
    return "No receipts\n";
  }

  const headers = [
    "Donation Date",
    "digiDov Donation ID",
    "Charity Name",
    "Donor Name",
    "Donor Email",
    "Blockchain",
    "Transaction Hash",
    "Crypto Amount (wei)",
    "Crypto Amount (units)",
    "Exchange Rate (CAD per unit)",
    "Gross Amount (CAD)",
    "Platform Fee (3%)",
    "Net Amount to Charity (CAD)",
  ];

  const rows = receipts.map((r) => {
    const donorName = r.donor
      ? `${r.donor.first_name ?? ""} ${r.donor.last_name ?? ""}`.trim()
      : "Anonymous";

    const gross = r.fiat_amount;
    // calculate a 3% fee, preserving precision for small amounts
    const feeRaw = gross * 0.03;
    // if fee is less than 1 cent, show up to 8 decimal places; otherwise 2 decimal places
    const fee = Number(feeRaw < 0.01 ? feeRaw.toFixed(8) : feeRaw.toFixed(2));
    const net = Number((gross - fee).toFixed(2));

    const blockchain = chainIdToName(r.chain);
    const cryptoWei = r.crypto_amount_wei ?? BigInt(0);
    const cryptoUnits = weiToEvm(cryptoWei);
    const exchangeRate =
      cryptoUnits > 0 ? (gross / cryptoUnits).toFixed(2) : "N/A";

    const cells = [
      r.donation_date,
      r.receipt_number,
      r.id,
      r.charity_name ?? r.charity?.charity_name ?? "",
      donorName,
      r.donor?.email ?? "",
      blockchain,
      r.transaction_hash,
      cryptoWei.toString(),
      cryptoUnits.toString(),
      exchangeRate,
      gross.toFixed(2),
      // format fee: use 8 decimals if <0.01, else 2 decimals
      feeRaw < 0.01 ? fee.toFixed(8) : fee.toFixed(2),
      // format net similarly
      net < 0.01 ? net.toFixed(8) : net.toFixed(2),
    ];

    return cells
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}
