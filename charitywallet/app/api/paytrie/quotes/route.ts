import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.PAYTRIE_API_KEY;
  if (!API_KEY) {
    console.error("Missing PAYTRIE_API_KEY");
    return NextResponse.json(
      { error: "Server misconfiguration: missing API key." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.paytrie.com/quotes", {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      // Normalize any error payload
      return NextResponse.json(
        { error: data.error ?? "Failed to fetch PayTrie quotes." },
        { status: res.status }
      );
    }

    // Return the live quotes array/object directly
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching PayTrie quotes:", err);
    return NextResponse.json(
      { error: "Unexpected error fetching quotes." },
      { status: 500 }
    );
  }
}
