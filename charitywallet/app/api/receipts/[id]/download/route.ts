import { NextResponse } from "next/server";
import { getDonationReceiptPdf } from "@/app/actions/receipts";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: { id: string };
    // we include this in the type, but do NOT destructure it,
    // so there’s no unused-variable complaint for searchParams
    searchParams: Record<string, string | string[]>;
  }
) {
  // mark `_request` as used to silence TS6133:
  void _request;

  const { id } = params;
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
