import { useCallback } from "react";

/**
 * Handles OTP send & verify with PayTrie.
 */
export function usePayTrieAuth(email: string) {
  const sendOtp = useCallback(async () => {
    const res = await fetch("/api/paytrie/login-code-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Unable to send OTP");
  }, [email]);

  const verifyOtp = useCallback(
    async (code: string) => {
      const res = await fetch("/api/paytrie/login-code-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, login_code: code }),
      });
      const json = await res.json();
      if (!res.ok || !json.token) throw new Error(json.error || "Invalid OTP");
      return json.token as string;
    },
    [email]
  );

  return { sendOtp, verifyOtp };
}
