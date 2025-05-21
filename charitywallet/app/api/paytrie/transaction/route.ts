// app/api/paytrie/transaction/route.ts

import { NextResponse } from "next/server";
import { PaytrieTxSchema } from "@/app/types/paytrie/paytrie-transaction-validation";

export async function POST(request: Request) {
  const API_KEY = process.env.PAYTRIE_API_KEY!;
  const DEPOSIT_ADDR = process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!;
  const USDC_DECIMALS = 6;

  if (!API_KEY || !DEPOSIT_ADDR) {
    console.error("[PayTrie API] Missing config");
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { jwt, ...payload } = body;
  if (!jwt) {
    return NextResponse.json({ error: "Missing JWT" }, { status: 400 });
  }

  // Validate payload schema
  try {
    PaytrieTxSchema.parse(payload);
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Submit to PayTrie
  let paytrieRes: Response;
  try {
    paytrieRes = await fetch("https://mod.paytrie.com/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Network error: " + err.message },
      { status: 502 }
    );
  }

  const text = await paytrieRes.text();
  if (!paytrieRes.ok) {
    console.error("[PayTrie] Error", paytrieRes.status, text);
    return NextResponse.json(
      { error: `PayTrie error: ${text}` },
      { status: paytrieRes.status }
    );
  }

  // Parse response
  let data: Array<{
    tx: string;
    fxRate: string;
    rightSideValue?: string;
  }>;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from PayTrie" },
      { status: 502 }
    );
  }

  const { tx, fxRate, rightSideValue } = data[0];
  if (!tx || !fxRate) {
    return NextResponse.json(
      { error: "Missing tx or fxRate in PayTrie response" },
      { status: 502 }
    );
  }

  // Compute deposit amount in smallest units
  const decimalValue =
    rightSideValue ?? payload.rightSideValue?.toString() ?? "0";
  let depositUnits: string;
  try {
    depositUnits = parseInt(decimalValue, USDC_DECIMALS).toString();
  } catch (e) {
    console.error("Failed to parse USDC amount:", decimalValue, e);
    return NextResponse.json({ error: "Invalid USDC amount" }, { status: 502 });
  }

  // Respond with fields for the front-end
  console.log("[PayTrie] Transaction created", {
    transactionId: tx,
    exchangeRate: fxRate,
    depositAddress: DEPOSIT_ADDR,
  });
  return NextResponse.json({
    transactionId: tx,
    exchangeRate: fxRate,
    depositAddress: DEPOSIT_ADDR,
    depositAmount: depositUnits,
  });
}
