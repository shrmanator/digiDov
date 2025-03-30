import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function GET() {
  // Generate a TOTP secret with your app's name
  const secret = speakeasy.generateSecret({ name: "digiDov" });

  // Generate a QR code from the otpauth URL
  const qrCodeData = await QRCode.toDataURL(secret.otpauth_url as string);

  // Return the secret (in base32 format) and the QR code data URI
  return NextResponse.json({ secret: secret.base32, qrCode: qrCodeData });
}
