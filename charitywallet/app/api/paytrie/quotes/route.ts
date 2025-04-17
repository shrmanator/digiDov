import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.PAYTRIE_API_KEY!;
  if (!API_KEY) {
    console.error("[PayTrie] Missing PAYTRIE_API_KEY");
    return NextResponse.json(
      { error: "Missing PAYTRIE_API_KEY" },
      { status: 500 }
    );
  }

  const QUOTES_URL = "https://mod.paytrie.com/quotes";

  try {
    const res = await fetch(QUOTES_URL, {
      headers: { "x-api-key": API_KEY },
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`[PayTrie] ${QUOTES_URL} → HTTP ${res.status}: ${txt}`);
      return NextResponse.json(
        { error: `HTTP ${res.status}: ${txt}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(
      "[PayTrie] Network error fetching quotes from",
      QUOTES_URL,
      err
    );
    return NextResponse.json(
      { error: `Network error: ${err.message}` },
      { status: 502 }
    );
  }
}
