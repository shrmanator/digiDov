// app/api/paytrie/transaction/route.ts
import { TxSchema } from "@/app/types/paytrie-transaction-validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const API_KEY = process.env.PAYTRIE_API_KEY!;
  const JWT = process.env.PAYTRIE_JWT!; // server‑only var

  if (!API_KEY || !JWT) {
    console.error("[PayTrie API] missing API_KEY or JWT");
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = TxSchema.parse(await request.json());
  } catch (e) {
    console.error("[PayTrie API] invalid payload", e);
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const res = await fetch("https://mod.paytrie.com/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[PayTrie API] upstream error", res.status, text);
      return NextResponse.json(
        { error: `Upstream ${res.status}: ${text}` },
        { status: res.status }
      );
    }
    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    console.error("[PayTrie API] network error", err);
    return NextResponse.json(
      { error: "Network error: " + err.message },
      { status: 502 }
    );
  }
}
