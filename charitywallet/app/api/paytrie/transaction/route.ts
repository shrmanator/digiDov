import { TxSchema } from "@/app/types/paytrie-transaction-validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const API_KEY = process.env.PAYTRIE_API_KEY!;
  if (!API_KEY) {
    console.error("[PayTrie] Missing PAYTRIE_API_KEY");
    return NextResponse.json(
      { error: "Missing PAYTRIE_API_KEY" },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = TxSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const TRANSACTION_URL = "https://mod.paytrie.com/transactions";

  try {
    const res = await fetch(TRANSACTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`[PayTrie] ${TRANSACTION_URL} → HTTP ${res.status}:`, data);
      return NextResponse.json(
        { error: data.error ?? "PayTrie transaction error" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[PayTrie] Network error posting to", TRANSACTION_URL, err);
    return NextResponse.json(
      { error: `Network error: ${err.message}` },
      { status: 502 }
    );
  }
}
