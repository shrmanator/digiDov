import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { PaytrieTxSchema } from "@/app/types/paytrie/paytrie-transaction-validation";

// Combine JWT string with Paytrie transaction schema
const CombinedSchema = z.object({ jwt: z.string() }).merge(PaytrieTxSchema);
type PaytrieRouteRequest = z.infer<typeof CombinedSchema>;

// Define a minimal shape for the PayTrie response
type PaytrieResult = {
  tx?: string;
  fxRate?: number;
  [key: string]: unknown;
};

export async function POST(request: NextRequest) {
  console.log("[PayTrie] Received POST /api/paytrie/transaction");
  const API_KEY = process.env.PAYTRIE_API_KEY;
  const DEPOSIT_ADDR = process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS;

  if (!API_KEY || !DEPOSIT_ADDR) {
    console.error("[PayTrie] Missing API_KEY or DEPOSIT_ADDR from env");
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );
  }

  // Read raw JSON
  let rawBody: unknown;
  try {
    rawBody = await request.json();
    console.log("[PayTrie] Raw request body:", rawBody);
  } catch (err: unknown) {
    console.error("[PayTrie] Invalid JSON in request body", err);
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Validate payload
  const parsed = CombinedSchema.safeParse(rawBody);
  if (!parsed.success) {
    console.error("[PayTrie] Payload validation failed", parsed.error.format());
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { jwt, ...payload } = parsed.data as PaytrieRouteRequest;
  console.log("[PayTrie] Validated payload:", payload);

  // Send transaction to PayTrie
  let paytrieRes: Response;
  try {
    console.log("[PayTrie] Sending to PayTrie endpoint with payload:", payload);
    paytrieRes = await fetch("https://mod.paytrie.com/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });
    console.log("[PayTrie] PayTrie responded with status", paytrieRes.status);
  } catch (err: unknown) {
    console.error("[PayTrie] Network error sending to PayTrie", err);
    return NextResponse.json(
      { error: "Network error sending to PayTrie" },
      { status: 502 }
    );
  }

  const text = await paytrieRes.text();
  console.log("[PayTrie] Raw response text from PayTrie:", text);
  if (!paytrieRes.ok) {
    console.error("[PayTrie] Error response", paytrieRes.status, text);
    return NextResponse.json(
      { error: `PayTrie error: ${text}` },
      { status: paytrieRes.status }
    );
  }

  // Parse PayTrie response (may be object or array)
  let result: PaytrieResult;
  try {
    const parsedRes = JSON.parse(text);
    console.log("[PayTrie] Parsed JSON from PayTrie:", parsedRes);
    const first = Array.isArray(parsedRes) ? parsedRes[0] : parsedRes;
    result = first as PaytrieResult;
  } catch (err: unknown) {
    console.error("[PayTrie] Failed to parse JSON from PayTrie", err);
    return NextResponse.json(
      { error: "Invalid JSON from PayTrie" },
      { status: 502 }
    );
  }

  // Ensure transaction ID exists
  const transactionId = result.tx;
  if (!transactionId) {
    console.error("[PayTrie] Missing tx in response", result);
    return NextResponse.json(
      { error: "Missing transaction ID from PayTrie" },
      { status: 502 }
    );
  }
  console.log("[PayTrie] transactionId=", transactionId);

  // Optional: Capture exchange rate
  const exchangeRate = typeof result.fxRate === "number" ? result.fxRate : null;
  console.log("[PayTrie] exchangeRate=", exchangeRate);

  // Pass decimal USDC-POLY amount directly
  const usdcDecimal = payload.leftSideValue;
  console.log("[PayTrie] leftSideValue (USDC decimal) =", usdcDecimal);
  const depositAmount = usdcDecimal.toString();
  console.log("[PayTrie] depositAmount (decimal) =", depositAmount);

  // Return full result
  const responseBody = {
    transactionId,
    exchangeRate,
    depositAddress: DEPOSIT_ADDR,
    depositAmount,
  };
  console.log("[PayTrie] Returning response to client", responseBody);
  return NextResponse.json(responseBody);
}

/**
 * Request JSON structure for /api/paytrie/transaction
 * {
 *   jwt: string;
 *   quoteId: number;
 *   gasId: number;
 *   email: string;
 *   wallet: string;
 *   leftSideLabel: string;    // e.g. "USDC-POLY"
 *   leftSideValue: number;     // decimal amount of USDC-POLY to sell
 *   rightSideLabel: string;   // e.g. "CAD"
 *   ethCost?: string;
 *   vendorId?: number;
 *   useReferral?: boolean;
 * }
 */
