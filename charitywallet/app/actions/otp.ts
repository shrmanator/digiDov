"use server";

import stytchClient from "@/lib/stytchClient";

/**
 * Custom error interface to capture expected properties from Stytch errors.
 */
interface StytchError extends Error {
  status_code?: number;
  error_message?: string;
}

/**
 * Standard response interface for OTP operations.
 */
export interface OtpResponse {
  status_code: number;
  email_id?: string;
  error_message?: string;
}

/**
 * Sends an OTP email via Stytch using the loginOrCreate endpoint.
 * @param email - The email address to send the OTP to.
 * @returns A promise resolving to an OtpResponse.
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
    const stytchError = error as StytchError;
    const status_code = stytchError.status_code ?? 500;
    const error_message =
      stytchError.error_message ||
      "Too many requests. Please wait a moment and try again.";
    console.error("Failed to send OTP", stytchError);
    return {
      status_code,
      error_message,
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
    const stytchError = error as StytchError;
    const status_code = stytchError.status_code ?? 500;
    console.error("OTP verification failed", stytchError);
    return {
      status_code,
      response: stytchError,
    };
  }
}
