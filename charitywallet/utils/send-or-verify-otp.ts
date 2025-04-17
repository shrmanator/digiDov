import {
  OtpVerifyResponse,
  sendOtpAction,
  verifyOtpAction,
  type OtpResponse,
} from "@/app/actions/otp";

/**
 * Thin client‑side wrappers so the UI layer never talks
 * to the server actions directly.
 */
export const sendOtp = (email: string) =>
  sendOtpAction(email) as Promise<OtpResponse>;

export const verifyOtp = (methodId: string, code: string) =>
  verifyOtpAction(methodId, code) as Promise<OtpVerifyResponse>;
