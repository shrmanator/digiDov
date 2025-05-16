import { PaytrieTxSchema } from "@/app/types/paytrie/paytrie-transaction-validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const API_KEY = process.env.PAYTRIE_API_KEY!;
  if (!API_KEY) {
    console.error("[PayTrie API] Missing PAYTRIE_API_KEY");
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { jwt, ...payload } = body;
  if (!jwt) {
    return NextResponse.json({ error: "Missing JWT" }, { status: 400 });
  }

  let validated;
  try {
    validated = PaytrieTxSchema.parse(payload);
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const res = await fetch("https://mod.paytrie.com/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(validated),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("[PayTrie] Error", res.status, text);
      return NextResponse.json(
        { error: `PayTrie error: ${text}` },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    return NextResponse.json(
      { error: "Network error: " + err.message },
      { status: 502 }
    );
  }
}
