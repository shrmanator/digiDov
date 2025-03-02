import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { donation_receipt, charity, donor } from "@prisma/client";

/**
 * Generates a properly formatted PDF receipt for a donation.
 */
export async function generateDonationReceiptPDF(
  receipt: donation_receipt & {
    charity?: charity | null;
    donor?: donor | null;
  }
): Promise<Uint8Array> {
  if (!receipt) {
    throw new Error("Invalid donation receipt data");
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 850]);
  const { width, height } = page.getSize();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 50;
  const lineSpacing = 20;
  const sectionSpacing = 30;
  const leftMargin = 50;

  const drawText = (
    text: string,
    x: number,
    y: number,
    size = 12,
    bold = false
  ) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? fontBold : fontRegular,
      color: rgb(0, 0, 0),
    });
  };

  // 🔹 Receipt Header
  drawText("Official Receipt for Income Tax Purposes", leftMargin, y, 14, true);
  y -= lineSpacing;
  drawText("(As required by the Canada Revenue Agency)", leftMargin, y, 10);
  y -= sectionSpacing;

  // 🔹 Receipt Details
  drawText(
    `Receipt Number: ${receipt.receipt_number}`,
    leftMargin,
    y,
    12,
    true
  );
  y -= lineSpacing;
  drawText(
    `Date of Donation: ${receipt.donation_date.toISOString()}`,
    leftMargin,
    y
  );
  y -= sectionSpacing;

  // 🔹 Donation Details (Fiat & Crypto)
  drawText("Donation Details", leftMargin, y, 14, true);
  y -= lineSpacing;
  drawText(`Amount in CAD: $${receipt.fiat_amount.toFixed(2)}`, leftMargin, y);
  y -= lineSpacing;

  if (receipt.crypto_amount_wei) {
    drawText(
      `Amount in Crypto: ${receipt.crypto_amount_wei.toString()} WEI`,
      leftMargin,
      y
    );
    y -= lineSpacing;
    drawText(`Transaction Hash: ${receipt.transaction_hash}`, leftMargin, y);
    y -= lineSpacing;
    drawText(`Blockchain: ${receipt.chainId ?? "N/A"}`, leftMargin, y);
    y -= sectionSpacing;
  }

  // 🔹 Donor Information
  drawText("Donor Information", leftMargin, y, 14, true);
  y -= lineSpacing;
  drawText(
    `Name: ${receipt.donor?.first_name ?? "Unknown"} ${
      receipt.donor?.last_name ?? ""
    }`,
    leftMargin,
    y
  );
  y -= lineSpacing;
  drawText(
    `Email: ${receipt.donor?.email ?? "No email provided"}`,
    leftMargin,
    y
  );
  y -= lineSpacing;
  drawText(`Address: ${receipt.donor?.address ?? "N/A"}`, leftMargin, y);
  y -= sectionSpacing;

  // 🔹 Charity Information
  drawText("Charity Information", leftMargin, y, 14, true);
  y -= lineSpacing;
  drawText(receipt.charity?.charity_name ?? "N/A", leftMargin, y, 12, true);
  y -= lineSpacing;
  drawText(
    `Address: ${receipt.charity?.registered_office_address ?? "N/A"}`,
    leftMargin,
    y
  );
  y -= lineSpacing;
  drawText(`Phone: ${receipt.charity?.contact_phone ?? "N/A"}`, leftMargin, y);
  y -= lineSpacing;
  drawText(`Email: ${receipt.charity?.contact_email ?? "N/A"}`, leftMargin, y);
  y -= lineSpacing;
  drawText(
    `Registered Charity Number: ${
      receipt.charity?.registration_number ?? "N/A"
    }`,
    leftMargin,
    y
  );
  y -= sectionSpacing;

  // 🔹 Authorized Signature
  drawText("Authorized Signature", leftMargin, y, 14, true);
  y -= lineSpacing;
  drawText(
    receipt.charity?.contact_name ?? "Authorized Representative",
    leftMargin,
    y
  );
  y -= lineSpacing;

  return await pdfDoc.save();
}
