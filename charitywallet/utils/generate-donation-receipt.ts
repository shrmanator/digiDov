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
  location_issued?: string;
}

function extractCityProvince(
  address: string
): { city: string; province: string } | null {
  if (!address) return null;
  const parts = address.split(",");
  if (parts.length < 3) return null;
  const city = parts[1].trim();
  const provinceMatch = parts[2].trim().match(/^([A-Z]{2})\b/);
  const province = provinceMatch ? provinceMatch[1] : "";
  return { city, province };
}

export async function generateDonationReceiptPDF(
  receipt: ReceiptData
): Promise<Uint8Array> {
  if (!receipt) throw new Error("Invalid donation receipt data");

  // --- Core info ---
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
  const donorEmail = receipt.donor?.email || "Not provided";

  const blockchainInfo = getBlockchainInfo(receipt.chainId);
  const cryptoAmount = receipt.crypto_amount_wei
    ? weiToEvm(receipt.crypto_amount_wei)
    : 0;
  const fiatAmount = receipt.fiat_amount || 0;
  const exchangeRate =
    cryptoAmount > 0 ? (fiatAmount / cryptoAmount).toFixed(2) : "N/A";

  const txHash = receipt.transaction_hash || "N/A";
  const walletAddress = receipt.donor?.wallet_address || "N/A";
  const issuedBy =
    "digiDov On Behalf of " + charityName + ", A Registered Canadian Charity";
  const issueDate = receipt.created_at
    ? new Date(receipt.created_at)
    : new Date();
  const receiptNumber = receipt.receipt_number || "N/A";

  const signerTitle = receipt.charity?.contact_title;
  const signerFirstName = receipt.charity?.contact_first_name;
  const signerLastName = receipt.charity?.contact_last_name;
  const locationIssued =
    receipt.location_issued ||
    (extractCityProvince(charityAddress)
      ? `${extractCityProvince(charityAddress)!.city}, ${
          extractCityProvince(charityAddress)!.province
        }`
      : "Unknown");

  // --- Donation Advantage fields ---
  // Assume `receipt.advantage_amount` is a float or null in donation_receipt
  // If it doesn't exist, default to 0
  const advantageFMV = receipt.charity?.advantage_amount ?? 0;
  const eligibleAmount = Math.max(fiatAmount - advantageFMV, 0);

  // --- Date/time formatter ---
  const formatDateTime = (date: Date) =>
    date.toLocaleString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Toronto",
    });

  // --- PDF setup ---
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontSignature = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const colors = {
    primary: rgb(0, 0, 0),
    secondary: rgb(0.4, 0.4, 0.4),
    accent: rgb(0.1, 0.3, 0.6),
    divider: rgb(0.7, 0.7, 0.7),
    signature: rgb(0.1, 0.2, 0.5),
  };

  const margin = 60;
  let y = height - margin;
  const lineHeight = { normal: 16, large: 24, small: 12 };

  // --- Drawing helpers ---
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
    page.drawText(text, { x: margin + offset, y, font, size, color });
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
    const maxWidth = width - 2 * margin;
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
        const textWidth = font.widthOfTextAtSize(line, size);
        page.drawText(line, {
          x: (width - textWidth) / 2,
          y,
          font,
          size,
          color,
        });
        y -= lineSpacing;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      const textWidth = font.widthOfTextAtSize(line, size);
      page.drawText(line, { x: (width - textWidth) / 2, y, font, size, color });
      y -= lineSpacing;
    }
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

  // --- Header ---
  drawCenteredText(
    "Official Donation Receipt For Income Tax Purposes (Non-Cash Gift – Cryptocurrency)",
    {
      font: fontBold,
      size: 15,
      color: colors.accent,
      lineSpacing: lineHeight.large,
    }
  );
  drawLine(y + lineHeight.small);
  y -= lineHeight.small;

  // --- Key receipt info block ---
  drawField("Receipt Serial Number", receiptNumber);
  drawField("Location Where Receipt Issued", locationIssued);
  drawField("Date Donation Received", formatDateTime(donationDate));
  drawField("Date Receipt Issued", formatDateTime(issueDate));
  y -= lineHeight.small;

  // --- Organization ---
  drawText("Organization Information", {
    font: fontBold,
    size: 12,
    color: colors.accent,
  });
  drawField("Organization Name", charityName);
  drawField("Address", charityAddress);
  drawField("Registration Number", registrationNumber);
  drawField("Email", charityEmail);
  drawField("Phone", charityPhone);
  y -= lineHeight.small;

  // --- Donor ---
  drawText("Donor Information", {
    font: fontBold,
    size: 12,
    color: colors.accent,
  });
  drawField("Name", donorName);
  drawField("Address", donorAddress);
  drawField("Email", donorEmail);
  y -= lineHeight.small;

  // --- Donation details ---
  drawText("Donation Details", {
    font: fontBold,
    size: 12,
    color: colors.accent,
  });
  drawField("Cryptocurrency Description", blockchainInfo.symbol);
  drawField("Amount Donated", `${cryptoAmount} ${blockchainInfo.symbol}`);
  drawField("Fair Market Value at Donation", `$${fiatAmount.toFixed(2)} CAD`);
  drawField(
    "Fair Market Value of Advantage",
    `$${advantageFMV.toFixed(2)} CAD`
  );
  drawField("Eligible Amount of Gift", `$${eligibleAmount.toFixed(2)} CAD`);
  drawField(
    "Exchange Rate Used",
    `1 ${blockchainInfo.symbol} = ${exchangeRate} CAD (CoinGecko)`
  );
  drawField("Transaction Hash", txHash);
  drawField("Wallet Address Used", walletAddress);

  y -= lineHeight.normal;
  drawLine();

  // --- Compliance ---
  drawText("CRA Compliance", {
    font: fontBold,
    size: 11,
    color: colors.accent,
  });
  drawText(
    "This receipt is provided for your records. Eligibility for tax deductions/credits",
    { size: 9, lineSpacing: lineHeight.small }
  );
  drawText(
    "depends on your local regulations. Please consult a qualified tax advisor.",
    { size: 9, lineSpacing: lineHeight.small }
  );
  drawText(
    "For verification, visit the CRA website: www.canada.ca/charities-giving",
    { size: 9, lineSpacing: lineHeight.normal }
  );

  // --- Receipt authentication ---
  y -= lineHeight.small;
  drawLine();
  drawField("This Official Receipt Is Issued By", issuedBy);
  y -= lineHeight.normal;

  // --- Signature ---
  if (signerTitle && signerFirstName && signerLastName) {
    const signatureText = `Digitally signed by: ${signerFirstName} ${signerLastName}, ${signerTitle}`;
    const dateText = `Date: ${formatDateTime(issueDate)}`;
    y -= 5;
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
      { x: margin, y, font: fontItalic, size: 8, color: colors.secondary }
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

  // --- Footer ---
  const footerText = "Thank you for your generous donation";
  const footerWidth = fontItalic.widthOfTextAtSize(footerText, 9);
  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: margin / 2,
    font: fontItalic,
    size: 9,
    color: colors.secondary,
  });

  return await pdfDoc.save();
}

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
