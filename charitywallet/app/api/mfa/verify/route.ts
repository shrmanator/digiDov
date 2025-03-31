import { NextResponse } from "next/server";
import stytchClient from "@/lib/stytchClient";

export async function POST(request: Request) {
  try {
    const { method_id, code } = await request.json();
    console.log("Verification request received:", { method_id, code });

    const response = await stytchClient.otps.authenticate({
      method_id, // This should be the email_id from the loginOrCreate response
      code,
      // Add optional parameters here if needed, e.g., session_duration_minutes
    });

    console.log("Stytch OTP authentication response:", response);
    return NextResponse.json({ status_code: response.status_code, response });
  } catch (error: any) {
    console.error("Error in /api/mfa/verify:", error);
    return NextResponse.json({ error: error.message });
  }
}
