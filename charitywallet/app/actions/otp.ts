"use server";

import stytchClient from "@/lib/stytchClient";

interface OtpResponse {
  status_code: number;
  email_id?: string;
  error_message?: string;
}

/**
 * Sends an OTP email via Stytch using the loginOrCreate endpoint.
 * @param email - The email address to send the OTP to.
 * @returns A promise resolving to an OTP response.
 */
export async function sendOtpAction(email: string): Promise<OtpResponse> {
  console.info(`Sending OTP to ${email}`);
  try {
    const response = await stytchClient.otps.email.loginOrCreate({
      email,
      expiration_minutes: 2,
    });
    console.info("OTP sent successfully", response);
    return {
      status_code: response.status_code,
      email_id: response.email_id,
    };
  } catch (error: unknown) {
    const err = error as { status_code?: number };
    const status_code = err.status_code ?? 500;
    console.error("Failed to send OTP", error);
    return {
      status_code,
      error_message: "Too many requests. Please wait a moment and try again.",
    };
  }
}

/**
 * Verifies an OTP using Stytch.
 * @param method_id - The email_id from the OTP response.
 * @param code - The OTP code entered by the user.
 * @returns A promise resolving to an object containing the status code and response.
 */
export async function verifyOtpAction(
  method_id: string,
  code: string
): Promise<{ status_code: number; response: unknown }> {
  console.info(`Verifying OTP for method_id: ${method_id}`);
  try {
    const response = await stytchClient.otps.authenticate({
      method_id,
      code,
    });
    console.info("OTP verified successfully", response);
    return {
      status_code: response.status_code,
      response,
    };
  } catch (error: unknown) {
    const err = error as { status_code?: number };
    const status_code = err.status_code ?? 500;
    console.error("OTP verification failed", error);
    return {
      status_code,
      response: error,
    };
  }
}
