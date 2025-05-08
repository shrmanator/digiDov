import { DonationReceipt } from "@/app/types/receipt";
import { chainIdToName } from "./chainid-to-name";
import { weiToEvm } from "./convert-wei-to-evm";

/**
 * Convert DonationReceipt[] to CSV string with full financial breakdown,
 * including donor_address and donor_wallet_address if present on the row.
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
    "Donor Address",
    "Donor Wallet Address",
    "Blockchain",
    "Transaction Hash",
    "Crypto Amount (wei)",
    "Crypto Amount (units)",
    "Exchange Rate (CAD per unit via CoinGecko)",
    "Gross Amount (CAD)",
    "Fair Market Value (CAD)",
    "Platform Fee (3% CAD)",
    "Net Amount to Charity (CAD)",
  ];

  const rows = receipts.map((r) => {
    const donorName = r.donor
      ? `${r.donor.first_name ?? ""} ${r.donor.last_name ?? ""}`.trim()
      : "Anonymous";

    const gross = r.fiat_amount;
    const feeRaw = gross * 0.03;
    const fee = Number(feeRaw < 0.01 ? feeRaw.toFixed(8) : feeRaw.toFixed(2));
    const net = Number((gross - fee).toFixed(2));

    const blockchain = chainIdToName(r.chain);
    const cryptoWei = r.crypto_amount_wei ?? BigInt(0);
    const cryptoUnits = weiToEvm(cryptoWei);
    const exchangeRate =
      cryptoUnits > 0 ? (gross / cryptoUnits).toFixed(2) : "N/A";

    // injected fields (fall back to empty string)
    const plainAddr = (r as any).donor_address ?? "";
    const walletAddr = (r as any).donor_wallet_address ?? "";

    const cells = [
      r.donation_date,
      r.id,
      r.charity_name ?? r.charity?.charity_name ?? "",
      donorName,
      r.donor?.email ?? "",
      plainAddr, // Donor Address
      walletAddr, // Donor Wallet Address
      blockchain,
      r.transaction_hash,
      cryptoWei.toString(),
      cryptoUnits.toString(),
      exchangeRate,
      gross.toFixed(2), // Gross Amount (CAD)
      gross.toFixed(2), // Fair Market Value (CAD)
      feeRaw < 0.01 ? fee.toFixed(8) : fee.toFixed(2),
      net < 0.01 ? net.toFixed(8) : net.toFixed(2),
    ];

    return cells
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}
