import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch("https://mod.paytrie.com/loginCodeVerify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.PAYTRIE_API_KEY!,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
