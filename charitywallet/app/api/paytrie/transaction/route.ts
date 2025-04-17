import { NextResponse } from "next/server";
import { z } from "zod";

const TxSchema = z.object({
  quoteId: z.number(),
  gasId: z.number(),
  email: z.string().email(),
  wallet: z.string().min(1),
  leftSideLabel: z.string(),
  leftSideValue: z.number(),
  rightSideLabel: z.string(),
  ethCost: z.string().optional(),
  vendorId: z.number().optional(),
  useReferral: z.boolean().optional(),
});

export async function POST(request: Request) {
  const API_KEY = process.env.PAYTRIE_API_KEY;
  if (!API_KEY) {
    console.error("Missing PAYTRIE_API_KEY");
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = TxSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const res = await fetch("https://api.paytrie.com/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "PayTrie error" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
