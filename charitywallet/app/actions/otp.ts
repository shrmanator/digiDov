"use server";

import stytchClient from "@/lib/stytchClient";

/**
 * Sends an OTP email via Stytch using the loginOrCreate endpoint.
 * @param email - The email address to send the OTP to.
 * @returns An object containing the status_code and email_id or a friendly error message.
 */
export async function sendOtpAction(email: string) {
  console.log("Sending OTP to:", email);
  try {
    const response = await stytchClient.otps.email.loginOrCreate({
      email,
      expiration_minutes: 2,
    });
    console.log("OTP sent response:", response);
    return {
      status_code: response.status_code,
      email_id: response.email_id,
    };
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    // Return a friendly message for 429 errors
    return {
      status_code: error.status_code || 500,
      error_message: "Too many requests. Please wait a moment and try again.",
    };
  }
}

/**
 * Verifies an OTP using Stytch.
 * @param method_id - The email_id from the send OTP response.
 * @param code - The OTP code entered by the user.
 * @returns An object containing the status_code and full response.
 */
export async function verifyOtpAction(method_id: string, code: string) {
  console.log("Verifying OTP:", { method_id, code });
  const response = await stytchClient.otps.authenticate({
    method_id,
    code,
    // Optional: session_duration_minutes, etc.
  });
  console.log("OTP verification response:", response);
  return {
    status_code: response.status_code,
    response,
  };
}
