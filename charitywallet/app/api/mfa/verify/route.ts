import { NextResponse } from "next/server";
import stytchClient from "@/lib/stytchClient";

export async function POST(request: Request) {
  // Expecting that the client sends { method_id, code }
  const { method_id, code } = await request.json();
  try {
    const response = await stytchClient.otps.authenticate({
      method_id, // This should be the email_id you got from sending the OTP
      code,
      // Include optional parameters if needed, e.g., session_duration_minutes
    });
    return NextResponse.json({ status_code: response.status_code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
