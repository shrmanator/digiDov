import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { donation_receipt, charity, donor } from "@prisma/client";
import { weiToEvm } from "../convert-wei-to-evm";

/**
 * Generates a concise, CRA-compliant PDF donation receipt.
 */
export async function generateDonationReceiptPDF(
  receipt: donation_receipt & {
    charity?: charity | null;
    donor?: donor | null;
  }
): Promise<Uint8Array> {
  if (!receipt) throw new Error("Invalid donation receipt data");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 60;
  const lineSpacing = 16;
  const sectionSpacing = 24;
  const margin = 50;

  const draw = (text: string, yPos: number, bold = false, size = 11) =>
    page.drawText(text, {
      x: margin,
      y: yPos,
      size,
      font: bold ? fontBold : fontRegular,
      color: rgb(0, 0, 0),
    });

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  // 🔹 Header
  draw("Official Donation Receipt for Income Tax Purposes", y, true, 13);
  y -= lineSpacing;
  draw("(As required by the Canada Revenue Agency)", y, false, 10);
  y -= sectionSpacing;

  // 🔹 Receipt Info
  draw(`Receipt #: ${receipt.receipt_number}`, y, true);
  y -= lineSpacing;
  draw(`Donation Date: ${formatDate(receipt.donation_date)}`, y);
  y -= sectionSpacing;

  // 🔹 Donation Details
  draw("Donation Details", y, true, 12);
  y -= lineSpacing;

  const grossCAD = receipt.fiat_amount;
  const feeCAD = grossCAD * 0.03;
  const netCAD = grossCAD - feeCAD;

  draw(`Gross Donation Amount: $${grossCAD.toFixed(2)} CAD`, y);
  y -= lineSpacing;
  draw(`Administrative Fee (3%): $${feeCAD.toFixed(2)} CAD`, y);
  y -= lineSpacing;
  draw(`Net Amount Donated: $${netCAD.toFixed(2)} CAD`, y);
  y -= sectionSpacing;

  if (receipt.crypto_amount_wei && receipt.transaction_hash) {
    const cryptoAmountEvm = weiToEvm(receipt.crypto_amount_wei);
    draw("Crypto Donation Details", y, true, 12);
    y -= lineSpacing;

    const blockchain =
      receipt.chainId === "0x89"
        ? "Polygon (POL)"
        : receipt.chainId === "0x1"
        ? "Ethereum (ETH)"
        : `Chain ID ${receipt.chainId ?? "N/A"}`;

    draw(`Blockchain: ${blockchain}`, y);
    y -= lineSpacing;
    draw(`Crypto Amount: ${cryptoAmountEvm} ${blockchain}`, y);
    y -= lineSpacing;
    draw(`Transaction Hash: ${receipt.transaction_hash}`, y);
    y -= sectionSpacing;
  }

  // 🔹 Donor Info
  draw("Donor Information", y, true, 12);
  y -= lineSpacing;

  const donorName = `${receipt.donor?.first_name ?? ""} ${
    receipt.donor?.last_name ?? ""
  }`.trim();
  draw(`Name: ${donorName || "Anonymous"}`, y);
  y -= lineSpacing;
  draw(`Email: ${receipt.donor?.email ?? "Not provided"}`, y);
  y -= lineSpacing;
  draw(`Address: ${receipt.donor?.address ?? "Not provided"}`, y);
  y -= sectionSpacing;

  // 🔹 Charity Info
  draw("Charity Information", y, true, 12);
  y -= lineSpacing;

  draw(`Charity Name: ${receipt.charity?.charity_name ?? "N/A"}`, y);
  y -= lineSpacing;
  draw(`Charity #: ${receipt.charity?.registration_number ?? "N/A"}`, y);
  y -= lineSpacing;
  draw(`Address: ${receipt.charity?.registered_office_address ?? "N/A"}`, y);
  y -= lineSpacing;
  draw(`Phone: ${receipt.charity?.contact_phone ?? "N/A"}`, y);
  y -= lineSpacing;
  draw(`Email: ${receipt.charity?.contact_email ?? "N/A"}`, y);
  y -= sectionSpacing;

  // 🔹 Signature
  draw("Authorized Signature", y, true, 12);
  y -= lineSpacing;
  draw(receipt.charity?.contact_name ?? "Authorized Representative", y);

  return await pdfDoc.save();
}
