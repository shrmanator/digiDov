import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, login_code } = body;

    if (!email || !login_code) {
      return NextResponse.json(
        { error: "Missing email or login_code" },
        { status: 400 }
      );
    }

    const apiKey = process.env.PAYTRIE_API_KEY;
    if (!apiKey) {
      console.error("[PayTrie] Missing PAYTRIE_API_KEY");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Build URL with query params
    const url =
      `https://mod.paytrie.com/loginCodeVerify` +
      `?email=${encodeURIComponent(email)}` +
      `&login_code=${encodeURIComponent(login_code)}`;

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
      console.error(`[PayTrie] loginCodeVerify failed (${res.status}):`, json);
    }

    return NextResponse.json(json, { status: res.status });
  } catch (err: any) {
    console.error("[PayTrie] loginCodeVerify error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
