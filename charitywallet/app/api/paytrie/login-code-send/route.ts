import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const apiKey = process.env.PAYTRIE_API_KEY;
    if (!apiKey) {
      console.error("[PayTrie] Missing PAYTRIE_API_KEY");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const url = `https://mod.paytrie.com/loginCodeSend?email=${encodeURIComponent(
      email
    )}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      console.error(`[PayTrie] loginCodeSend failed (${res.status}):`, json);
    }

    return NextResponse.json(json, { status: res.status });
  } catch (err: any) {
    console.error("[PayTrie] loginCodeSend error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
