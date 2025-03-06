import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFFont,
  LineCapStyle,
  Color,
} from "pdf-lib";
import { donation_receipt, charity, donor } from "@prisma/client";
import { weiToEvm } from "../convert-wei-to-evm";

/**
 * Generates a visually appealing, CRA-compliant PDF donation receipt.
 */
export async function generateDonationReceiptPDF(
  receipt: donation_receipt & {
    charity?: charity | null;
    donor?: donor | null;
  }
): Promise<Uint8Array> {
  if (!receipt) throw new Error("Invalid donation receipt data");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 842]); // Standard A4 size
  const { width, height } = page.getSize();

  // Configuration for spacing, margins, and dimensions
  const config = {
    margin: 60,
    lineSpacing: 18,
    sectionSpacing: 28,
    headerHeight: 120,
    receiptBoxHeight: 60,
    donorBoxHeight: 100,
    charityBoxHeight: 155,
    signatureBoxHeight: 70,
  };
  const contentWidth = width - config.margin * 2;

  // Load fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Define colors
  const primaryColor = rgb(0.13, 0.17, 0.43); // Dark blue
  const accentColor = rgb(0.55, 0.71, 0.85); // Light blue
  const textColor = rgb(0.2, 0.2, 0.2); // Dark gray
  const subtleColor = rgb(0.6, 0.6, 0.6); // Subtle gray

  // ─── Helper Functions ─────────────────────────────────────────────
  // Draw left-aligned text at a given x, y position
  const drawText = (
    text: string,
    x: number,
    y: number,
    options: { font?: PDFFont; size?: number; color?: Color } = {}
  ) => {
    const { font = fontRegular, size = 10, color = textColor } = options;
    page.drawText(text, { x, y, font, size, color });
  };

  // Draw centered text using the page width
  const drawCenteredText = (
    text: string,
    y: number,
    options: { font?: PDFFont; size?: number; color?: Color } = {}
  ) => {
    const { font = fontRegular, size = 10, color = textColor } = options;
    const textWidth = font.widthOfTextAtSize(text, size);
    drawText(text, (width - textWidth) / 2, y, { font, size, color });
  };

  // Draw right-aligned text with a fixed right margin
  const drawRightAlignedText = (
    text: string,
    y: number,
    options: { font?: PDFFont; size?: number; color?: Color } = {}
  ) => {
    const { font = fontRegular, size = 10, color = textColor } = options;
    const textWidth = font.widthOfTextAtSize(text, size);
    drawText(text, width - config.margin - textWidth, y, { font, size, color });
  };

  // Draw a horizontal line
  const drawLine = (
    y: number,
    lineWidth: number = contentWidth,
    startX: number = config.margin
  ) => {
    page.drawLine({
      start: { x: startX, y },
      end: { x: startX + lineWidth, y },
      thickness: 1,
      color: accentColor,
      opacity: 0.8,
      lineCap: LineCapStyle.Round,
    });
  };

  // Draw section title with an underline and return the new y-position
  const drawSectionTitle = (title: string, y: number): number => {
    drawText(title, config.margin, y, {
      font: fontBold,
      size: 12,
      color: primaryColor,
    });
    const titleWidth = fontBold.widthOfTextAtSize(title, 12);
    drawLine(y - 5, titleWidth + 10, config.margin);
    return y - config.lineSpacing - 5;
  };

  // Format date as "Month Day, Year"
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));

  // ─── Start Drawing the Receipt ───────────────────────────────────
  let y = height - config.margin;

  // HEADER SECTION
  page.drawRectangle({
    x: 0,
    y: height - config.headerHeight,
    width,
    height: config.headerHeight,
    color: rgb(0.95, 0.95, 0.98),
  });
  page.drawLine({
    start: { x: 0, y: height - config.headerHeight },
    end: { x: width, y: height - config.headerHeight },
    thickness: 4,
    color: accentColor,
  });
  drawCenteredText("OFFICIAL DONATION RECEIPT", y, {
    font: fontBold,
    size: 22,
    color: primaryColor,
  });
  y -= config.lineSpacing + 6;
  drawCenteredText("For Income Tax Purposes", y, {
    font: fontItalic,
    size: 14,
    color: primaryColor,
  });
  y -= config.lineSpacing - 2;
  drawCenteredText("(As required by the Canada Revenue Agency)", y, {
    font: fontRegular,
    size: 10,
    color: subtleColor,
  });
  y -= 60; // Extra space after header

  // RECEIPT INFO BOX
  page.drawRectangle({
    x: config.margin,
    y: y - config.receiptBoxHeight,
    width: contentWidth,
    height: config.receiptBoxHeight,
    color: rgb(0.97, 0.97, 1),
    borderColor: accentColor,
    borderWidth: 1,
    borderOpacity: 0.5,
  });
  // Left side: Receipt number
  drawText("Receipt #", config.margin + 10, y - 20, {
    font: fontBold,
    size: 10,
    color: subtleColor,
  });
  drawText(receipt.receipt_number, config.margin + 10, y - 38, {
    font: fontBold,
    size: 12,
  });
  // Right side: Donation Date
  drawRightAlignedText("Donation Date", y - 20, {
    font: fontBold,
    size: 10,
    color: subtleColor,
  });
  drawRightAlignedText(formatDate(receipt.donation_date), y - 38, {
    font: fontRegular,
    size: 12,
  });
  y -= config.receiptBoxHeight + 30;

  // DONATION DETAILS SECTION
  y = drawSectionTitle("Donation Details", y);
  const grossCAD = receipt.fiat_amount;
  const feeCAD = grossCAD * 0.03;
  const netCAD = grossCAD - feeCAD;

  // Background for donation details
  page.drawRectangle({
    x: config.margin,
    y: y - 50,
    width: contentWidth,
    height: 50,
    color: rgb(0.97, 0.97, 1),
    borderColor: accentColor,
    borderWidth: 1,
    borderOpacity: 0.3,
  });

  // Donation amounts table
  drawText(
    "Fair Market Value of Cryptocurrency Donated:",
    config.margin + 5,
    y,
    { font: fontRegular, size: 10 }
  );
  drawRightAlignedText(`$${grossCAD.toFixed(2)} CAD`, y, {
    font: fontRegular,
    size: 10,
  });
  y -= config.lineSpacing;
  drawText("Less Administrative Fee (3%):", config.margin + 5, y, {
    font: fontRegular,
    size: 10,
  });
  drawRightAlignedText(`$${feeCAD.toFixed(2)} CAD`, y, {
    font: fontRegular,
    size: 10,
    color: subtleColor,
  });
  y -= config.lineSpacing;
  drawLine(y - 2, contentWidth - 10);
  y -= 10;
  drawText("Eligible Amount For Tax Purposes (97%):", config.margin + 5, y, {
    font: fontBold,
    size: 10,
  });
  drawRightAlignedText(`$${netCAD.toFixed(2)} CAD`, y, {
    font: fontBold,
    size: 10,
  });
  y -= config.lineSpacing + 5;
  drawText(
    "Fair market value determination: Based on exchange rate at the time donation was received.",
    config.margin + 5,
    y,
    { font: fontRegular, size: 9, color: subtleColor }
  );
  y -= config.lineSpacing - 5;
  drawText(
    "No advantage was received in exchange for this donation.",
    config.margin + 5,
    y,
    { font: fontRegular, size: 9, color: subtleColor }
  );
  y -= config.sectionSpacing;

  // CRYPTOCURRENCY DETAILS (if provided)
  if (receipt.crypto_amount_wei && receipt.transaction_hash) {
    y = drawSectionTitle("Cryptocurrency Details", y);
    const cryptoAmountEvm = weiToEvm(receipt.crypto_amount_wei);
    const blockchainInfo = getBlockchainInfo(receipt.chainId);
    const colWidth = contentWidth / 2 - 10;

    // Left column for blockchain and crypto amount
    let colY = y;
    drawText("Blockchain:", config.margin + 5, colY, {
      font: fontRegular,
      size: 10,
    });
    drawText(
      blockchainInfo.name,
      config.margin + 5,
      colY - config.lineSpacing,
      {
        font: fontBold,
        size: 10,
      }
    );
    drawText(
      "Crypto Amount:",
      config.margin + 5,
      colY - config.lineSpacing * 2.5,
      {
        font: fontRegular,
        size: 10,
      }
    );
    drawText(
      `${cryptoAmountEvm} ${blockchainInfo.symbol}`,
      config.margin + 5,
      colY - config.lineSpacing * 3.5,
      { font: fontBold, size: 10 }
    );

    // Right column for transaction hash
    drawText("Transaction Hash:", config.margin + colWidth + 15, colY, {
      font: fontRegular,
      size: 10,
    });
    const formattedTxHash = formatTransactionHash(receipt.transaction_hash);
    drawText(
      formattedTxHash,
      config.margin + colWidth + 15,
      colY - config.lineSpacing,
      { font: fontRegular, size: 9 }
    );
    y = colY - config.sectionSpacing - config.lineSpacing * 3.5;
  }

  // TWO-COLUMN LAYOUT FOR DONOR AND CHARITY INFORMATION
  const colWidth = contentWidth / 2 - 10;
  const donorStartY = y;
  // Donor Info Box
  page.drawRectangle({
    x: config.margin,
    y: donorStartY - config.donorBoxHeight,
    width: colWidth,
    height: config.donorBoxHeight,
    color: rgb(0.97, 0.97, 1),
    borderColor: accentColor,
    borderWidth: 1,
    borderOpacity: 0.3,
  });
  let donorY = drawSectionTitle("Donor Information", donorStartY);
  drawText("Name:", config.margin + 5, donorY, {
    font: fontRegular,
    size: 9,
    color: subtleColor,
  });
  const donorName =
    `${receipt.donor?.first_name ?? ""} ${
      receipt.donor?.last_name ?? ""
    }`.trim() || "Anonymous";
  drawText(donorName, config.margin + 5, donorY - config.lineSpacing + 5, {
    font: fontRegular,
    size: 10,
  });
  donorY -= config.lineSpacing * 1.5;
  drawText("Email:", config.margin + 5, donorY, {
    font: fontRegular,
    size: 9,
    color: subtleColor,
  });
  drawText(
    receipt.donor?.email ?? "Not provided",
    config.margin + 5,
    donorY - config.lineSpacing + 5,
    { font: fontRegular, size: 10 }
  );
  donorY -= config.lineSpacing * 1.5;
  drawText("Address:", config.margin + 5, donorY, {
    font: fontRegular,
    size: 9,
    color: subtleColor,
  });
  drawText(
    receipt.donor?.address ?? "Not provided",
    config.margin + 5,
    donorY - config.lineSpacing + 5,
    { font: fontRegular, size: 10 }
  );

  // Charity Info Box (placed parallel to donor info)
  const charityStartX = config.margin + colWidth + 20;
  page.drawRectangle({
    x: charityStartX,
    y: donorStartY - config.charityBoxHeight - 10,
    width: colWidth,
    height: config.charityBoxHeight,
    color: rgb(0.97, 0.97, 1),
    borderColor: accentColor,
    borderWidth: 1,
    borderOpacity: 0.3,
  });
  let charityY = donorStartY;
  drawText("Charity Information", charityStartX + 5, charityY, {
    font: fontBold,
    size: 12,
    color: primaryColor,
  });
  const charityTitleWidth = fontBold.widthOfTextAtSize(
    "Charity Information",
    12
  );
  drawLine(charityY - 5, charityTitleWidth + 10, charityStartX + 5);
  charityY -= config.lineSpacing;
  drawText("Name:", charityStartX + 5, charityY, {
    font: fontRegular,
    size: 9,
    color: subtleColor,
  });
  drawText(
    receipt.charity?.charity_name ?? "N/A",
    charityStartX + 5,
    charityY - config.lineSpacing + 5,
    { font: fontRegular, size: 10 }
  );
  charityY -= config.lineSpacing * 1.5;
  drawText("Registration #:", charityStartX + 5, charityY, {
    font: fontRegular,
    size: 9,
    color: subtleColor,
  });
  drawText(
    receipt.charity?.registration_number ?? "N/A",
    charityStartX + 5,
    charityY - config.lineSpacing + 5,
    { font: fontRegular, size: 10 }
  );
  charityY -= config.lineSpacing * 1.5;
  drawText("Address:", charityStartX + 5, charityY, {
    font: fontRegular,
    size: 9,
    color: subtleColor,
  });
  drawText(
    receipt.charity?.registered_office_address ?? "N/A",
    charityStartX + 5,
    charityY - config.lineSpacing + 5,
    { font: fontRegular, size: 10 }
  );
  charityY -= config.lineSpacing * 1.5;
  drawText("Contact:", charityStartX + 5, charityY, {
    font: fontRegular,
    size: 9,
    color: subtleColor,
  });
  drawText(
    receipt.charity?.contact_phone ?? "N/A",
    charityStartX + 5,
    charityY - config.lineSpacing + 5,
    { font: fontRegular, size: 10 }
  );
  charityY -= config.lineSpacing - 5;
  if (receipt.charity?.contact_email) {
    drawText(
      receipt.charity.contact_email,
      charityStartX + 5,
      charityY - config.lineSpacing + 5,
      { font: fontRegular, size: 10 }
    );
  }
  y = donorStartY - config.charityBoxHeight - 30;

  // CERTIFICATION & SIGNATURE
  y = drawSectionTitle("Certification", y);
  const certificationText =
    "I certify that the information above is accurate and that this donation qualifies as a gift in accordance with the regulations of the Canada Revenue Agency.";
  const words = certificationText.split(" ");
  let lineBuffer = "";
  let certY = y;
  for (const word of words) {
    const testLine = lineBuffer ? `${lineBuffer} ${word}` : word;
    const testWidth = fontRegular.widthOfTextAtSize(testLine, 10);
    if (testWidth > contentWidth - 20 && lineBuffer) {
      drawText(lineBuffer, config.margin + 5, certY, {
        font: fontRegular,
        size: 10,
      });
      lineBuffer = word;
      certY -= config.lineSpacing - 4;
    } else {
      lineBuffer = testLine;
    }
  }
  if (lineBuffer) {
    drawText(lineBuffer, config.margin + 5, certY, {
      font: fontRegular,
      size: 10,
    });
  }
  y = certY - config.lineSpacing * 2;

  // Adjusted Y position to move the signature box up slightly
  const signatureBoxY = y - config.signatureBoxHeight + 25; // Moves it up

  // Signature Box (Better Layout)
  page.drawRectangle({
    x: config.margin,
    y: signatureBoxY,
    width: contentWidth,
    height: config.signatureBoxHeight,
    borderColor: primaryColor,
    borderWidth: 1.2,
    borderOpacity: 0.8,
  });

  // Inline Layout: Authorized Representative Name + Label + Date (All inside the box)
  const inlineText = `${
    receipt.charity?.contact_name ?? "Authorized Representative"
  } | Authorized Representative | Date: ${formatDate(receipt.donation_date)}`;
  drawCenteredText(inlineText, signatureBoxY + config.signatureBoxHeight / 2, {
    font: fontBold,
    size: 10,
  });

  // FOOTER
  // Footer background
  // Footer Background with More Height
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 50, // More height for better spacing
    color: rgb(0.95, 0.95, 0.98),
  });

  // Top border for footer
  page.drawLine({
    start: { x: 0, y: 50 },
    end: { x: width, y: 50 },
    thickness: 2,
    color: accentColor,
  });

  // CRA Information (One Line)
  drawCenteredText(
    "Issued under the Canada Revenue Agency (CRA) guidelines",
    35,
    { font: fontRegular, size: 9, color: subtleColor }
  );

  // CRA Website (Larger Font & Better Spacing)
  drawCenteredText(
    "More info: https://www.canada.ca/en/services/taxes/charities.html",
    20,
    { font: fontRegular, size: 10, color: primaryColor }
  );

  // Page Number (Lower Position)
  drawCenteredText("Page 1 of 1", 8, {
    font: fontRegular,
    size: 8,
    color: subtleColor,
  });

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
      return { name: `Chain ID ${chainId ?? "N/A"}`, symbol: "CRYPTO" };
  }
}

/**
 * Helper function to format transaction hash for better readability
 */
function formatTransactionHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  // Format as 0x1234...5678 if too long
  if (hash.length > 16) {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`;
  }
  return hash;
}
