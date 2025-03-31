// app/api/mfa/send/route.ts
import stytch from "@/lib/stytch";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { destination } = await request.json(); // destination: user's email
  try {
    const response = await stytch.otps.email.loginOrCreate({
      email: destination,
    });
    return NextResponse.json({ status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
