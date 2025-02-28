/**
 * Generates a PDF receipt for a donation.
 */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Generates a properly formatted PDF receipt for a donation.
 */
export async function generateDonationReceiptPDF(
  receipt: any
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 50;
  const lineSpacing = 20;
  const sectionSpacing = 30;

  const drawText = (text: string, x: number, y: number, size = 12) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  };

  // Title
  drawLine(y);
  y -= lineSpacing;
  drawText("OFFICIAL DONATION RECEIPT FOR INCOME TAX PURPOSES", 100, y, 14);
  y -= lineSpacing;
  drawLine(y);
  y -= sectionSpacing;

  // Charity Info
  drawText(`Charity Name: ${receipt.charity.charity_name ?? "N/A"}`, 50, y);
  y -= lineSpacing;
  drawText(
    `Charity Mailing Address: ${receipt.charity.charity_address ?? "N/A"}`,
    50,
    y
  );
  y -= lineSpacing;
  drawText(
    `Registration Number: ${receipt.charity.registration_number ?? "N/A"}`,
    50,
    y
  );
  y -= sectionSpacing;

  // Donor Information
  drawLine(y);
  y -= lineSpacing;
  drawText("Donor Information", 50, y, 14);
  y -= lineSpacing;
  drawLine(y);
  y -= lineSpacing;

  drawText(
    `Name: ${receipt.donor.first_name ?? ""} ${receipt.donor.last_name ?? ""}`,
    50,
    y
  );
  y -= lineSpacing;
  drawText(`Email: ${receipt.donor.email ?? "N/A"}`, 50, y);
  y -= lineSpacing;
  drawText(`Address: ${receipt.donor.address ?? "N/A"}`, 50, y);
  y -= sectionSpacing;

  // Donation Details
  drawLine(y);
  y -= lineSpacing;
  drawText("Donation Details", 50, y, 14);
  y -= lineSpacing;
  drawLine(y);
  y -= lineSpacing;

  drawText(`Receipt Number: ${receipt.receipt_number}`, 50, y);
  y -= lineSpacing;
  drawText(`Date: ${receipt.donation_date.toISOString().split("T")[0]}`, 50, y);
  y -= lineSpacing;
  drawText(`Amount Donated: ${receipt.fiat_amount.toFixed(2)} CAD`, 50, y);
  y -= lineSpacing;

  const cryptoAmountWei = receipt.crypto_amount_wei
    ? receipt.crypto_amount_wei.toString()
    : "N/A";
  drawText(`Crypto Donated: ${cryptoAmountWei} Wei`, 50, y);
  y -= lineSpacing;
  drawText(
    `Crypto Value in CAD: ${
      receipt.crypto_value_in_fiat?.toFixed(2) ?? "N/A"
    } CAD`,
    50,
    y
  );
  y -= lineSpacing;
  drawText(`Transaction Hash: ${receipt.transaction_hash}`, 50, y, 10);
  y -= lineSpacing;
  drawText(`Blockchain Network: ${receipt.chainId}`, 50, y);
  y -= sectionSpacing;

  // Tax Compliance Section
  drawLine(y);
  y -= lineSpacing;
  drawText("Tax Compliance", 50, y, 14);
  y -= lineSpacing;
  drawLine(y);
  y -= lineSpacing;

  drawText(`Jurisdiction: ${receipt.jurisdiction}`, 50, y);
  y -= lineSpacing;
  drawText(
    receipt.special_tax_notes ? receipt.special_tax_notes : "",
    50,
    y,
    10
  );
  y -= sectionSpacing;

  // Legal Disclaimer
  drawText(
    `"No goods or services were provided in exchange for this donation."`,
    50,
    y,
    10
  );
  y -= sectionSpacing;

  // Signature
  drawLine(y);
  y -= lineSpacing;
  drawText(
    `Signature: ${
      receipt.charity.representative ?? "Authorized Representative"
    }`,
    50,
    y
  );
  y -= lineSpacing;
  drawLine(y);

  return await pdfDoc.save();
}
