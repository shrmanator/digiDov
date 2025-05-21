import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { PaytrieTxSchema } from "@/app/types/paytrie/paytrie-transaction-validation";

// Combine JWT string with Paytrie transaction schema
const CombinedSchema = z.object({ jwt: z.string() }).merge(PaytrieTxSchema);

type PaytrieRouteRequest = z.infer<typeof CombinedSchema>;

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

  // Read and validate request
  const rawBody = await request.json();
  console.log("[PayTrie] Raw request body:", rawBody);
  const parsed = CombinedSchema.safeParse(rawBody);
  if (!parsed.success) {
    console.error("[PayTrie] Payload validation failed", parsed.error.format());
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { jwt, ...payload } = parsed.data as PaytrieRouteRequest;
  console.log("[PayTrie] Validated payload:", payload);

  // Fake transaction for testing
  console.log("[PayTrie] Fake mode: simulating transaction result");
  const transactionId = `tx-${Date.now()}`;
  const exchangeRate = null;
  const depositAmount = payload.leftSideValue.toString();
  const responseBody = {
    transactionId,
    exchangeRate,
    depositAddress: DEPOSIT_ADDR,
    depositAmount,
  };
  console.log("[PayTrie] Fake response to client", responseBody);
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
 *   leftSideLabel: string;
 *   leftSideValue: number;
 *   rightSideLabel: string;
 *   ethCost?: string;
 *   vendorId?: number;
 *   useReferral?: boolean;
 * }
 */
