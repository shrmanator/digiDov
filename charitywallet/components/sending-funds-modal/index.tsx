"use client";

import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BalanceDisplay from "./balance-display";
import QuoteDisplay from "./quote-display";
import OtpModal from "@/components/opt-modal";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { usePayTrieQuote } from "@/hooks/use-paytrie-quotes";
import { usePayTrieTransaction } from "@/hooks/use-paytrie-transaction";
import type { TxPayload } from "@/app/types/paytrie-transaction-validation";

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email?: string | null };
}) {
  const [open, setOpen] = useState(false);

  // OTP flow state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Transaction state
  const [pendingPayload, setPendingPayload] = useState<TxPayload | null>(
    null
  );
  const [jwt, setJwt] = useState<string | null>(null);

  // Data hooks
  const balance = useWalletBalance(charity.wallet_address);
  const { quote, isLoading: quoteLoading, error: quoteError } =
    usePayTrieQuote();
  const [amount, setAmount] = useState("");
  const { execute, data, error, isLoading } = usePayTrieTransaction();

  // 1️⃣ When user clicks “Withdraw”, prepare payload and send OTP once
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quote || isLoading) return;

    // If the OTP modal is already open, do nothing
    if (otpModalOpen) return;

    const payload: TxPayload = {
      quoteId: quote.id,
      gasId: quote.gasId,
      email: charity.contact_email || "",
      wallet: charity.wallet_address,
      leftSideLabel: "USDC-POLY",
      leftSideValue: parseFloat(amount),
      rightSideLabel: "CAD",
    };
    setPendingPayload(payload);

    // Send OTP only on first click
    if (!otpSent) {
      try {
        const res = await fetch("/api/paytrie/login-code-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: payload.email }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to send OTP");
        }
        setOtpSent(true);
      } catch (err: any) {
        console.error("[PayTrie] Error sending OTP:", err);
        setOtpError("Unable to send OTP — please try again later.");
        return;
      }
    }

    // Open the OTP modal
    setOtpModalOpen(true);
  };

  // 2️⃣ When OTPModal calls onVerified, verify code & then run transaction
  const handleOtpVerified = async (otp: string) => {
    // Clear any prior errors
    setOtpError("");

    // Call your verify route
    const res = await fetch("/api/paytrie/login-code-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: charity.contact_email,
        login_code: otp,
      }),
    });
    const result = await res.json();
    if (!res.ok || !result.token) {
      throw new Error(result.error || "Invalid OTP");
    }

    // Got a JWT!
    setJwt(result.token);

    // Close OTP modal but keep otpSent = true
    setOtpModalOpen(false);

    // 3️⃣ Execute the PayTrie transaction
    if (pendingPayload) {
      await execute(pendingPayload, result.token);
      setPendingPayload(null);

      // Reset OTP flow so you can do another withdraw later
      setOtpSent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Transfer Funds To Bank</Button>
      </DialogTrigger>

      <DialogContent style={{ width: "clamp(320px, 90vw, 480px)" }}>
        <DialogHeader>
          <DialogTitle>Transfer Funds To Bank</DialogTitle>
        </DialogHeader>

        <BalanceDisplay balance={balance} />
        <QuoteDisplay />

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="0.0001"
            min="0"
            placeholder="Amount (USDC‑POLY)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full border rounded p-2"
          />

          <Button
            type="submit"
            disabled={
              !quote ||
              !amount ||
              isNaN(Number(amount)) ||
              isLoading ||
              !!data ||
              otpModalOpen      // ← disable while OTP modal is open
            }
            className="w-full"
          >
            {isLoading
              ? "Processing…"
              : data
              ? "Done!"
              : otpModalOpen
              ? "Awaiting OTP…"
              : "Withdraw"}
          </Button>

          {quoteLoading && <p>Loading pricing…</p>}
          {quoteError && (
            <p className="text-red-600">{quoteError.message}</p>
          )}
          {error && (
            <p className="text-red-600">Error: {error.message}</p>
          )}
          {data && (
            <div className="p-2 bg-muted border rounded text-sm">
              <p className="text-success font-medium">Success! 🎉</p>
              <p className="font-mono mt-1 break-all">{data.tx}</p>
            </div>
          )}
          {otpError && (
            <p className="text-red-600">OTP Error: {otpError}</p>
          )}
        </form>
      </DialogContent>

      <OtpModal
        isOpen={otpModalOpen}
        onOpenChange={setOtpModalOpen}
        email={charity.contact_email || "no email"}
        onVerified={handleOtpVerified}
      />
    </Dialog>
  );
}
