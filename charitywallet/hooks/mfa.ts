import { useState } from "react";

interface MfaResponse {
  status_code?: number;
  error?: string;
}

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
