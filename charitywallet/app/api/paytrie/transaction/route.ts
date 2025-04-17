import {
  TxPayload,
  TxSchema,
} from "@/app/types/paytrie-transaction-validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const API_KEY = process.env.PAYTRIE_API_KEY;
  if (!API_KEY)
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );

  let payload: TxPayload;
  try {
    payload = TxSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
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
      { error: data.error ?? "PayTrie error" },
      { status: res.status }
    );
  }
  return NextResponse.json(data);
}
