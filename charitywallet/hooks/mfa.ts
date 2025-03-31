import { useState } from "react";

/**
 * Interface for MFA API responses.
 */
export interface MfaResponse {
  status_code?: number;
  error?: string;
}

/**
 * Custom hook for handling MFA (Multi-Factor Authentication).
 *
 * Manages:
 * - **isVerified**: whether the OTP has been verified.
 * - **loading**: whether an OTP API call is in progress.
 * - **error**: error message from OTP API calls.
 *
 * Provides:
 * - **sendOtp(email: string)**: Sends an OTP to the given email.
 * - **verifyOtp(methodId: string, code: string)**: Verifies the OTP for a given method ID.
 * - **setIsVerified**: Allows manual update of the verification state.
 *
 * @returns An object with MFA state and functions.
 */
export function useMfa() {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp(email: string): Promise<MfaResponse> {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mfa/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: MfaResponse = await res.json();
      setLoading(false);
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
      return { error: err.message };
    }
  }

  async function verifyOtp(
    methodId: string,
    code: string
  ): Promise<MfaResponse> {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method_id: methodId, code }),
      });
      const data: MfaResponse = await res.json();
      if (data.status_code === 200) {
        setIsVerified(true);
      }
      setLoading(false);
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
      return { error: err.message };
    }
  }

  return { isVerified, loading, error, sendOtp, verifyOtp, setIsVerified };
}
