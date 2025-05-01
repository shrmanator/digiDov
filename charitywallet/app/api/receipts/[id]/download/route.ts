import { NextResponse } from "next/server";
import { getDonationReceiptPdf } from "@/app/actions/receipts";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // fetch base64 PDF
  const pdfBase64 = await getDonationReceiptPdf(id);
  const pdfBuffer = Buffer.from(pdfBase64, "base64");

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${id}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
