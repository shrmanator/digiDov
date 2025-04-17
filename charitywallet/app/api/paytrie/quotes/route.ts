// app/api/paytrie/quotes/route.ts
import { NextResponse } from "next/server";

export const revalidate = 300; // seconds: 5 minutes

export async function GET() {
  const API_KEY = process.env.PAYTRIE_API_KEY!;
  if (!API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    // Next’s fetch with built‑in ISR caching
    const res = await fetch("https://mod.paytrie.com/quotes", {
      headers: { "x-api-key": API_KEY },
      // this tells Next.js to cache the result for 300s
      next: { revalidate: 300 },
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[PayTrie] Quotes error", res.status, text);
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[PayTrie] Network error", err);
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
