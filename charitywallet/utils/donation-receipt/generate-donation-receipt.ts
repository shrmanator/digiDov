import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { donation_receipt, charity, donor } from "@prisma/client";
import { weiToEvm } from "../convert-wei-to-evm";

/**
 * Generates a CRA-compliant PDF donation receipt for cryptocurrency donations.
 * Contains only information required by the Canada Revenue Agency.
 */
export async function generateDonationReceiptPDF(
  receipt: donation_receipt & {
    charity?: charity | null;
    donor?: donor | null;
  }
): Promise<Uint8Array> {
  if (!receipt) throw new Error("Invalid donation receipt data");

  // Ensure date_of_issue is present
  const receiptData = {
    ...receipt,
    date_of_issue: receipt.created_at || new Date().toISOString(),
  };

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Standard letter size
  const { width, height } = page.getSize();

  // Load fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Define colors and layout
  const primaryColor = rgb(0, 0, 0.6); // Dark blue
  const textColor = rgb(0, 0, 0); // Black
  const margin = 50;
  const footerHeight = 40; // Reserved space for footer

  // Dynamically adjust line height based on content
  const calculateLineHeight = (contentSize: number) => {
    // Estimate available space and adjust line height
    const availableSpace = height - 2 * margin - footerHeight - contentSize;
    // Default line height is 24, but can be compressed if needed
    return Math.max(16, Math.min(24, availableSpace / 20)); // 20 is estimated number of lines
  };

  // Initial estimate of content size for standard sections
  const initialContentSize = 400; // Estimate for headers, fields, etc.
  let lineHeight = calculateLineHeight(initialContentSize);

  // Helper functions
  const drawText = (
    text: string,
    x: number,
    y: number,
    options: {
      font?: typeof fontRegular;
      size?: number;
      color?: typeof textColor;
    } = {}
  ) => {
    const { font = fontRegular, size = 10, color = textColor } = options;
    page.drawText(text, { x, y, font, size, color });
    return y - lineHeight;
  };

  const drawTitle = (
    text: string,
    x: number,
    y: number,
    options: { size?: number } = {}
  ) => {
    const { size = 12 } = options;
    return drawText(text, x, y, { font: fontBold, size, color: primaryColor });
  };

  const drawLine = (y: number) => {
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    return y - 10;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Start drawing the receipt
  let y = height - margin;

  // Header - CRA Required
  y = drawTitle("OFFICIAL DONATION RECEIPT", margin, y, { size: 16 });
  y = drawText("For Income Tax Purposes (Canada Revenue Agency)", margin, y);
  y = drawLine(y - 10);

  // Receipt Info - CRA Required
  y = drawText(`Receipt Number: ${receipt.receipt_number}`, margin, y - 10);
  y = drawText(
    `Date of Issue: ${formatDate(receiptData.date_of_issue.toISOString())}`,
    margin,
    y
  );
  y = drawText(
    `Date of Donation: ${formatDate(receipt.donation_date.toISOString())}`,
    margin,
    y
  );
  y = drawLine(y - 10);

  // Charity Information - CRA Required
  y = drawTitle("CHARITY INFORMATION", margin, y - 10);
  y = drawText(`Name: ${receipt.charity?.charity_name || "N/A"}`, margin, y);
  y = drawText(
    `Registration Number: ${receipt.charity?.registration_number || "N/A"}`,
    margin,
    y
  );
  y = drawText(
    `Address: ${receipt.charity?.registered_office_address || "N/A"}`,
    margin,
    y
  );
  y = drawLine(y - 10);

  // Donor Information - CRA Required
  y = drawTitle("DONOR INFORMATION", margin, y - 10);
  const donorName =
    `${receipt.donor?.first_name || ""} ${
      receipt.donor?.last_name || ""
    }`.trim() || "Anonymous";
  y = drawText(`Name: ${donorName}`, margin, y);
  y = drawText(
    `Address: ${receipt.donor?.address || "Not provided"}`,
    margin,
    y
  );
  y = drawLine(y - 10);

  // Donation Details - CRA Required
  y = drawTitle("DONATION DETAILS", margin, y - 10);
  y = drawText("Type of Donation: Cryptocurrency (Gift in Kind)", margin, y);

  // Calculate donation values
  const grossCAD = receipt.fiat_amount;

  y = drawText(`Total Amount Received: ${grossCAD.toFixed(2)} CAD`, margin, y);

  // Statement of Advantage - CRA Required
  y = drawText(`Advantage Amount: 0.00 CAD`, margin, y);
  y = drawText(
    `Eligible Amount for Tax Purposes: ${grossCAD.toFixed(2)} CAD`,
    margin,
    y,
    { font: fontBold }
  );

  // Check remaining space and adjust spacing if needed
  const remainingSpace = y - margin - footerHeight;
  const neededSpaceForRest = 200; // Estimated space needed for remaining content

  // If space is tight, reduce line height for remaining content
  if (remainingSpace < neededSpaceForRest) {
    lineHeight = Math.max(14, lineHeight * 0.8);
  }

  // FMV Determination details - CRA Required
  // Use the transaction timestamp for the valuation time, not the current time
  const valuationTime = new Date(
    receipt.updated_at || receipt.donation_date
  ).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  // Calculate exchange rate if not stored directly
  let exchangeRate = "N/A";
  if (receipt.fiat_amount && receipt.crypto_amount_wei) {
    const cryptoAmount = weiToEvm(receipt.crypto_amount_wei);
    if (cryptoAmount > 0) {
      exchangeRate = (receipt.fiat_amount / cryptoAmount).toFixed(2);
    }
  }

  y = drawText(
    `Fair market value determined using CoinGecko exchange rate at time of donation: ${valuationTime}`,
    margin,
    y,
    { size: 9 }
  );
  y = drawText(
    `Exchange rate used: ${exchangeRate || "N/A"} CAD per ${
      getBlockchainInfo(receipt.chainId).symbol
    }`,
    margin,
    y,
    { size: 9 }
  );

  // Cryptocurrency Details - As supporting information
  if (receipt.crypto_amount_wei && receipt.transaction_hash) {
    const shortLine = remainingSpace < neededSpaceForRest ? 5 : 10;
    y = drawLine(y - shortLine);
    y = drawTitle("GIFT DESCRIPTION", margin, y - shortLine);
    const cryptoAmount = weiToEvm(receipt.crypto_amount_wei);
    const blockchainInfo = getBlockchainInfo(receipt.chainId);

    y = drawText(
      `Description: ${cryptoAmount} ${blockchainInfo.symbol} cryptocurrency`,
      margin,
      y
    );

    // If transaction hash is long, break it across multiple lines or truncate if very tight on space
    const hash = receipt.transaction_hash;
    if (remainingSpace < neededSpaceForRest && hash.length > 40) {
      const hashPart1 = hash.substring(0, 40);
      const hashPart2 = hash.substring(40);
      y = drawText(`Transaction Hash: ${hashPart1}`, margin, y);
      y = drawText(hashPart2, margin + 105, y);
    } else {
      y = drawText(
        `Transaction Hash: https://blockscan.com/tx/${hash}`,
        margin,
        y
      );
    }
  }

  // Certification - CRA Required
  const shortLine = remainingSpace < neededSpaceForRest ? 5 : 10;
  y = drawLine(y - shortLine);
  y = drawTitle("CERTIFICATION", margin, y - shortLine);

  // Adjust certification text size if space is tight
  const certTextSize = remainingSpace < neededSpaceForRest ? 9 : 10;
  y = drawText(
    "I certify that this donation qualifies as a gift in accordance with the requirements of the Income Tax Act (Canada).",
    margin,
    y,
    { size: certTextSize }
  );

  // Skip space for signature - adjust based on remaining space
  const signatureSpace = remainingSpace < neededSpaceForRest ? 25 : 40;
  y = y - signatureSpace;

  // // Draw signature line
  // page.drawLine({
  //   start: { x: margin, y: y + 15 },
  //   end: { x: margin + 200, y: y + 15 },
  //   thickness: 1,
  //   color: rgb(0, 0, 0),
  // });

  // Add signature text UNDER the line
  const signerName =
    receipt.charity?.contact_first_name && receipt.charity?.contact_last_name
      ? `${receipt.charity.contact_first_name} ${receipt.charity.contact_last_name}`
      : "Authorized Representative";
  y = drawText(signerName, margin, y, { font: fontBold });
  y = drawText("Authorized Representative", margin, y, { size: 9 });

  // Footer - CRA Required - fixed position at bottom with safe margin
  const footerY = margin;
  drawLine(footerY + 30);
  drawText(
    "This receipt is an official receipt for income tax purposes.",
    margin,
    footerY + 15
  );

  // CRA website reference - Required
  drawText(
    "For information on all registered charities in Canada under the Income Tax Act, please visit: canada.ca/charities-giving",
    margin,
    footerY,
    { size: 8 }
  );

  return await pdfDoc.save();
}

/**
 * Helper function to get blockchain information
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
