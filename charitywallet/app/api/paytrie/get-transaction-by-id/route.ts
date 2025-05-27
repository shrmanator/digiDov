import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_id = searchParams.get("tx_id");
    if (!tx_id) {
      return NextResponse.json({ error: "Missing tx_id" }, { status: 400 });
    }

    const apiKey = process.env.PAYTRIE_API_KEY;
    if (!apiKey) {
      console.error("[PayTrie] Missing PAYTRIE_API_KEY");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const url = `https://mod.paytrie.com/getTransactionById?tx_id=${encodeURIComponent(
      tx_id
    )}`;
    const res = await fetch(url, {
      headers: { "x-api-key": apiKey },
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      console.error(
        `[PayTrie] getTransactionById error (${res.status}):`,
        data
      );
      return NextResponse.json(data, { status: res.status });
    }

    // PayTrie returns an array; we just forward it
    return NextResponse.json(data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[PayTrie] getTransactionById exception:", err.message);
    } else {
      console.error("[PayTrie] getTransactionById exception (non-Error):", err);
    }
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
