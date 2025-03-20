import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { donation_receipt, charity, donor } from "@prisma/client";
import { weiToEvm } from "../convert-wei-to-evm";

interface ReceiptData extends donation_receipt {
  charity?: (charity & { ein?: string }) | null;
  donor?: donor | null;
  wallet_address?: string;
  issued_by?: string;
}

/**
 * Generates a CRA-compliant PDF donation receipt for cryptocurrency donations.
 * The PDF includes exactly the following fields:
 *
 * ====================================================
 *                 OFFICIAL DONATION RECEIPT
 * ====================================================
 *
 * **Charity Name:** [charity.charity_name]
 * **Registration Number:** [charity.registration_number]
 * **EIN:** [charity.ein]
 * **Address:** [charity.registered_office_address]
 * **Date of Donation:** [formatted donation_date]
 * **Donor Name:** [donor first_name + last_name]
 * **Donor Address:** [donor.address]
 * **Cryptocurrency Donated:** [blockchain symbol]
 * **Amount Donated:** [crypto amount] [blockchain symbol]
 * **Fair Market Value (Fiat Equivalent):** [fiat_amount formatted as USD]
 * **Exchange Rate Used:** 1 [blockchain symbol] = [calculated exchange rate] USD
 * **Transaction Hash:** [receipt.transaction_hash]
 * **Wallet Address Used:** [receipt.wallet_address]
 *
 * ---------------------------------------------------
 * ❖ **For U.S. Donors (IRS Compliance)**:
 * No goods or services were provided in exchange for this donation, other than intangible religious benefits (if applicable). This contribution is tax-deductible to the extent allowed by law. Please consult your tax advisor for details.
 *
 * ---------------------------------------------------
 * ❖ **For Canadian Donors (CRA Compliance)**:
 * This receipt is issued under the Income Tax Act of Canada and is valid for tax purposes. No advantage was received in exchange for this donation.
 * For verification, visit the CRA website: www.canada.ca/charities-giving
 *
 * ---------------------------------------------------
 * **Issued By:** [issued_by]
 * **Date of Issue:** [formatted created_at]
 * ====================================================
 */
export async function generateDonationReceiptPDF(
  receipt: ReceiptData
): Promise<Uint8Array> {
  if (!receipt) throw new Error("Invalid donation receipt data");

  // Fallbacks for missing fields
  const charityName = receipt.charity?.charity_name || "N/A";
  const registrationNumber = receipt.charity?.registration_number || "N/A";
  const ein = receipt.charity?.ein || "N/A";
  const charityAddress = receipt.charity?.registered_office_address || "N/A";
  const donationDate = receipt.donation_date
    ? new Date(receipt.donation_date)
    : new Date();
  const donorFirstName = receipt.donor?.first_name || "";
  const donorLastName = receipt.donor?.last_name || "";
  const donorName =
    (donorFirstName + " " + donorLastName).trim() || "Anonymous";
  const donorAddress = receipt.donor?.address || "Not provided";
  const blockchainInfo = getBlockchainInfo(receipt.chainId);
  const cryptoAmount = receipt.crypto_amount_wei
    ? weiToEvm(receipt.crypto_amount_wei)
    : 0;
  const fiatAmount = receipt.fiat_amount || 0;
  const exchangeRate =
    cryptoAmount > 0 ? (fiatAmount / cryptoAmount).toFixed(2) : "N/A";
  const txHash = receipt.transaction_hash || "N/A";
  const walletAddress = receipt.donor?.wallet_address || "N/A";
  const issuedBy = "Digidov";
  const issueDate = receipt.created_at
    ? new Date(receipt.created_at)
    : new Date();

  // Date formatting helper
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Create PDF document and page
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  // Load fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Layout settings
  const margin = 50;
  let y = height - margin;
  const lineSpacing = 16;

  // Helper function: draw text left-aligned
  const drawText = (
    text: string,
    font = fontRegular,
    size: number = 10,
    offset = 0
  ) => {
    page.drawText(text, {
      x: margin + offset,
      y,
      font,
      size,
      color: rgb(0, 0, 0),
    });
    y -= lineSpacing;
  };

  // Helper function: draw centered text
  const drawCenteredText = (
    text: string,
    font = fontRegular,
    size: number = 10
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = (width - textWidth) / 2;
    page.drawText(text, { x, y, font, size, color: rgb(0, 0, 0) });
    y -= lineSpacing;
  };

  // Draw header
  drawText("====================================================");
  drawCenteredText("OFFICIAL DONATION RECEIPT", fontBold, 14);
  drawText("====================================================");
  y -= lineSpacing / 2;

  // Receipt fields (using markdown-style formatting as provided)
  drawText(`**Charity Name:** ${charityName}`);
  drawText(`**Registration Number:** ${registrationNumber}`);
  // drawText(`**EIN:** ${ein}`);
  drawText(`**Address:** ${charityAddress}`);
  drawText(`**Date of Donation:** ${formatDate(donationDate)}`);
  drawText(`**Donor Name:** ${donorName}`);
  drawText(`**Donor Address:** ${donorAddress}`);
  drawText(`**Cryptocurrency Donated:** ${blockchainInfo.symbol}`);
  drawText(`**Amount Donated:** ${cryptoAmount} ${blockchainInfo.symbol}`);
  drawText(
    `**Fair Market Value (Fiat Equivalent):** $${fiatAmount.toFixed(2)} CAD`
  );
  drawText(
    `**Exchange Rate Used:** 1 ${blockchainInfo.symbol} = ${exchangeRate} CAD`
  );
  drawText(`**Transaction Hash:** ${txHash}`);
  drawText(`**Wallet Address Used:** ${walletAddress}`);
  y -= lineSpacing / 2;
  drawText("---------------------------------------------------");

  // // U.S. Compliance
  // drawText("**For U.S. Donors (IRS Compliance):**", fontBold);
  // drawText(
  //   "No goods or services were provided in exchange for this donation, other than intangible religious benefits (if applicable). This contribution is tax-deductible to the extent allowed by law. Please consult your tax advisor for details."
  // );
  // y -= lineSpacing / 2;
  // drawText("---------------------------------------------------");

  // Canadian Compliance
  // drawText("**For Canadian Donors (CRA Compliance):**", fontBold);
  drawText(
    "This receipt is issued under the Income Tax Act of Canada and is valid for tax purposes. "
  );
  drawText("No advantage was received in exchange for this donation.");

  drawText(
    "For verification, visit the CRA website: www.canada.ca/charities-giving (https://www.canada.ca/en/revenue-agency/services/charities-giving.html)"
  );

  y -= lineSpacing / 2;
  drawText("---------------------------------------------------");

  // Footer
  drawText(`**Issued By:** ${issuedBy}`);
  drawText(`**Date of Issue:** ${formatDate(issueDate)}`);
  drawText("====================================================");

  return await pdfDoc.save();
}

/**
 * Helper function to get blockchain information based on chainId.
 */
function getBlockchainInfo(chainId: string | null): {
  name: string;
  symbol: string;
} {
  switch (chainId) {
    case "0x89":
      return { name: "Polygon Network", symbol: "POL" };
    case "0x1":
      return { name: "Ethereum Mainnet", symbol: "ETH" };
    case "0xa":
      return { name: "Optimism", symbol: "OP" };
    case "0xa4b1":
      return { name: "Arbitrum One", symbol: "ARB" };
    default:
      return { name: `Chain ID ${chainId ?? "Unknown"}`, symbol: "CRYPTO" };
  }
}
