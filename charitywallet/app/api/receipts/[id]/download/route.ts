
import { NextResponse } from "next/server";
import { getDonationReceiptPdf } from "@/app/actions/receipts";

export async function GET(
  _request: Request,
  {
    params,
    searchParams: _searchParams,
  }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[]>>;
  }
) {
  // silence TS6133 for unused parameters
  void _request;
  void _searchParams;

  // Next.js 15+ makes `params` a Promise so we await it :contentReference[oaicite:0]{index=0}
  const { id } = await params;

  // fetch and decode the Base64 PDF
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
