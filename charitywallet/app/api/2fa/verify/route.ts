import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";

export async function POST(request: NextRequest) {
  const { secret, token } = await request.json();

  // Verify the token using the provided secret
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });

  return NextResponse.json({ verified: isValid });
}
