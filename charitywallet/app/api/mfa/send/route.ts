import { NextResponse } from "next/server";
import stytchClient from "@/lib/stytchClient";

export async function POST(request: Request) {
  const { email } = await request.json();
  try {
    const response = await stytchClient.otps.email.send({
      email,
      // Optional: expiration_minutes, locale, etc.
    });
    // Use status_code from the response instead of status.
    return NextResponse.json({ status: response.status_code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
