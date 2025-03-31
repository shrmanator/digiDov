import { NextResponse } from "next/server";
import stytchClient from "@/lib/stytchClient";

export async function POST(request: Request) {
  console.log("MFA send endpoint hit");
  try {
    const { email } = await request.json();
    console.log("Sending OTP to:", email);
    // Use loginOrCreate to handle new emails in Live mode
    const response = await stytchClient.otps.email.loginOrCreate({
      email,
      // Optional parameters: expiration_minutes, locale, etc.
    });
    console.log("OTP sent response:", response);
    return NextResponse.json({
      status_code: response.status_code,
      email_id: response.email_id,
    });
  } catch (error: any) {
    console.error("Error in /api/mfa/send:", error);
    return NextResponse.json({ error: error.message });
  }
}
