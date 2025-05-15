import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { donation_receipt, charity, donor } from "@prisma/client";
import { weiToEvm } from "./convert-wei-to-evm";

interface ReceiptData extends donation_receipt {
  charity?: (charity & { ein?: string }) | null;
  donor?: donor | null;
  wallet_address?: string;
  issued_by?: string;
  contact_first_name?: string;
  contact_last_name?: string;
}

/**
 * Generates a clean, professional PDF donation receipt for cryptocurrency donations
 * that meets compliance requirements while maintaining readability.
 */
export async function generateDonationReceiptPDF(
  receipt: ReceiptData
): Promise<Uint8Array> {
  if (!receipt) throw new Error("Invalid donation receipt data");

  // Extract and prepare data with fallbacks
  const charityName = receipt.charity?.charity_name || "N/A";
  const registrationNumber = receipt.charity?.registration_number || "N/A";
  const charityAddress = receipt.charity?.registered_office_address || "N/A";
  const charityEmail = receipt.charity?.contact_email || "N/A";
  const charityPhone = receipt.charity?.contact_mobile_phone || "N/A";
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
  const issuedBy = "digiDov Toronto, Ontario, Canada";
  const issueDate = receipt.created_at
    ? new Date(receipt.created_at)
    : new Date();
  const receiptNumber = receipt.receipt_number || "N/A";
  const signerTitle = receipt.charity?.contact_title;
  const signerFirstName = receipt.charity?.contact_first_name;
  const signerLastName = receipt.charity?.contact_last_name;

  // Date and time formatting helper
  const formatDateTime = (date: Date) =>
    date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  // Load fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontSignature = await pdfDoc.embedFont(StandardFonts.CourierBold); // Font for signature

  // Color palette
  const colors = {
    primary: rgb(0, 0, 0), // Black for main text
    secondary: rgb(0.4, 0.4, 0.4), // Dark gray for secondary text
    accent: rgb(0.1, 0.3, 0.6), // Navy blue for headings
    divider: rgb(0.7, 0.7, 0.7), // Light gray for dividers
    signature: rgb(0.1, 0.2, 0.5), // Dark blue for signature
  };

  // Layout settings
  const margin = 60;
  let y = height - margin;
  const lineHeight = {
    normal: 16,
    large: 24,
    small: 12,
  };

  // Drawing helpers
  const drawText = (
    text: string,
    {
      font = fontRegular,
      size = 10,
      offset = 0,
      color = colors.primary,
      lineSpacing = lineHeight.normal,
    } = {}
  ) => {
    page.drawText(text, {
      x: margin + offset,
      y,
      font,
      size,
      color,
    });
    y -= lineSpacing;
  };

  const drawCenteredText = (
    text: string,
    {
      font = fontRegular,
      size = 10,
      color = colors.primary,
      lineSpacing = lineHeight.normal,
    } = {}
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = (width - textWidth) / 2;
    page.drawText(text, {
      x,
      y,
      font,
      size,
      color,
    });
    y -= lineSpacing;
  };

  const drawLine = (yPosition = y, thickness = 1) => {
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness,
      color: colors.divider,
    });
    y -= lineHeight.normal;
  };

  const drawField = (label: string, value: string) => {
    const labelText = `${label}: `;
    page.drawText(labelText, {
      x: margin,
      y,
      font: fontBold,
      size: 10,
      color: colors.primary,
    });

    const labelWidth = fontBold.widthOfTextAtSize(labelText, 10);
    page.drawText(value, {
      x: margin + labelWidth,
      y,
      font: fontRegular,
      size: 10,
      color: colors.primary,
    });

    y -= lineHeight.normal;
  };

  // Draw header
  drawCenteredText("OFFICIAL DONATION RECEIPT", {
    font: fontBold,
    size: 16,
    color: colors.accent,
    lineSpacing: lineHeight.large,
  });

  // Add receipt number prominently near the top
  drawCenteredText(`Receipt #: ${receiptNumber}`, {
    font: fontBold,
    size: 12,
    color: colors.accent,
    lineSpacing: lineHeight.normal,
  });

  drawLine(y + lineHeight.small);
  y -= lineHeight.small;

  // Organization section
  drawText("Charitable Organization", {
    font: fontBold,
    size: 12,
    color: colors.accent,
  });

  drawField("Charity Name", charityName);
  drawField("Registration Number", registrationNumber);
  drawField("Address", charityAddress);
  drawField("Email", charityEmail);
  drawField("Phone", charityPhone);

  y -= lineHeight.small;

  // Donor section
  drawText("Donor Information", {
    font: fontBold,
    size: 12,
    color: colors.accent,
  });

  drawField("Name", donorName);
  drawField("Address", donorAddress);
  drawField("Date Tax Receipt Issued", formatDateTime(issueDate));

  y -= lineHeight.small;

  // Donation details section
  drawText("Donation Details", {
    font: fontBold,
    size: 12,
    color: colors.accent,
  });
  drawField("Cryptocurrency Description", blockchainInfo.symbol);
  drawField("Date and Time of Donation", formatDateTime(donationDate));
  drawField(
    "Amount Donated for Tax Purposes",
    `${cryptoAmount} ${blockchainInfo.symbol}`
  );
  drawField(
    "Fair Market Value At Time of Donation",
    `$${fiatAmount.toFixed(2)} CAD`
  );
  drawField(
    "Exchange Rate Used",
    `1 ${blockchainInfo.symbol} = ${exchangeRate} CAD (CoinGecko)`
  );
  drawField("Transaction Hash", txHash);
  drawField("Wallet Address Used", walletAddress);

  y -= lineHeight.normal;
  drawLine();

  // Compliance section
  drawText("CRA Compliance", {
    font: fontBold,
    size: 11,
    color: colors.accent,
  });

  drawText(
    "This receipt is issued under the Income Tax Act of Canada and is valid for tax purposes.",
    {
      size: 9,
      lineSpacing: lineHeight.small,
    }
  );

  drawText("No advantage was received in exchange for this donation.", {
    size: 9,
    lineSpacing: lineHeight.small,
  });

  drawText(
    "For verification, visit the CRA website: www.canada.ca/charities-giving",
    {
      size: 9,
      lineSpacing: lineHeight.normal,
    }
  );

  // Receipt authentication section
  y -= lineHeight.small;
  drawLine();

  drawField("Issued By", issuedBy);

  // Add digital signature
  y -= lineHeight.normal;

  if (signerTitle && signerFirstName && signerLastName) {
    const signatureText = `Digitally signed by: ${signerFirstName} ${signerLastName}, ${signerTitle}`;
    const dateText = `Date: ${formatDateTime(donationDate)}`;

    y -= 5; // Small space below the line

    page.drawText(signatureText, {
      x: margin,
      y,
      font: fontSignature,
      size: 10,
      color: colors.signature,
    });

    y -= lineHeight.small;

    page.drawText(dateText, {
      x: margin,
      y,
      font: fontRegular,
      size: 8,
      color: colors.secondary,
    });

    y -= lineHeight.normal;
    page.drawText(
      "This document has been electronically signed and is legally binding.",
      {
        x: margin,
        y,
        font: fontItalic,
        size: 8,
        color: colors.secondary,
      }
    );
  } else {
    y -= lineHeight.small;
    page.drawText("Signature", {
      x: margin,
      y,
      font: fontItalic,
      size: 8,
      color: colors.secondary,
    });
  }

  // Add subtle footer
  const footerText = "Thank you for your generous donation";
  const footerTextWidth = fontItalic.widthOfTextAtSize(footerText, 9);
  page.drawText(footerText, {
    x: (width - footerTextWidth) / 2,
    y: margin / 2,
    font: fontItalic,
    size: 9,
    color: colors.secondary,
  });

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
