"use server";

import stytchClient from "@/lib/stytchClient";

/** Minimal shape of a Stytch SDK error */
export interface StytchError extends Error {
  status_code?: number;
  error_message?: string;
}

/** Response returned by sendOtpAction */
export interface OtpResponse {
  status_code: number;
  email_id?: string;
  error_message?: string;
}

/** Response returned by verifyOtpAction */
export interface OtpVerifyResponse {
  status_code: number;
  /**
   * On success this is Stytch’s auth response; on failure it is the
   * StytchError we caught.  Kept as `unknown` so callers decide how to use it.
   */
  response: unknown;
}

/* ------------------------------------------------------------------ */
/*  Server Actions                                                 */
/* ------------------------------------------------------------------ */

/**
 * Sends an OTP email using Stytch’s loginOrCreate flow.
 */
export async function sendOtpAction(email: string): Promise<OtpResponse> {
  console.info(`Sending OTP to ${email}`);
  try {
    const res = await stytchClient.otps.email.loginOrCreate({
      email,
      expiration_minutes: 2,
    });
    console.info("OTP sent successfully", res);
    return {
      status_code: res.status_code,
      email_id: res.email_id,
    };
  } catch (err: unknown) {
    const e = err as StytchError;
    console.error("Failed to send OTP", e);
    return {
      status_code: e.status_code ?? 500,
      error_message: e.error_message ?? "Failed to send OTP. Please try again.",
    };
  }
}

/**
 * Verifies an OTP using Stytch’s authenticate flow.
 */
export async function verifyOtpAction(
  method_id: string,
  code: string
): Promise<OtpVerifyResponse> {
  console.info(`Verifying OTP for method_id: ${method_id}`);
  try {
    const res = await stytchClient.otps.authenticate({ method_id, code });
    console.info("OTP verified successfully", res);
    return {
      status_code: res.status_code,
      response: res,
    };
  } catch (err: unknown) {
    const e = err as StytchError;
    console.error("OTP verification failed", e);
    return {
      status_code: e.status_code ?? 500,
      response: e,
    };
  }
}
