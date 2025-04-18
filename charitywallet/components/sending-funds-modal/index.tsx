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
import { usePayTrieQuote } from "@/hooks/use-paytrie-quotes";
import { usePayTrieTransaction } from "@/hooks/use-paytrie-transaction";
import type { TxPayload } from "@/app/types/paytrie-transaction-validation";
import BalanceDisplay from "./balance-display";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import QuoteDisplay from "./quote-display";
import OtpModal from "@/components/opt-modal"; // Reuse your existing OTP modal

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<TxPayload | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);

  const balance = useWalletBalance(charity.wallet_address);
  const { quote, isLoading: qL, error: qE } = usePayTrieQuote();
  const [amount, setAmount] = useState("");

  const { execute, data, error, isLoading } = usePayTrieTransaction();

  // Step 1: trigger OTP when submitting form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quote || isLoading) return;

    const payload: TxPayload = {
      quoteId: quote.id,
      gasId: quote.gasId,
      email: charity.contact_email ?? "",
      wallet: charity.wallet_address,
      leftSideLabel: "USDC-POLY",
      leftSideValue: parseFloat(amount),
      rightSideLabel: "CAD",
    };

    setPendingPayload(payload);

    // Trigger loginCodeSend via your API
    await fetch("/api/paytrie/login-code-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email }),
    });

    setOtpModalOpen(true);
  };

  // Step 2: Handle verified OTP
  const handleOtpVerified = async (otp: string) => {
    const res = await fetch("/api/paytrie/login-code-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: charity.contact_email,
        login_code: otp,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.token) {
      throw new Error(json.error || "Invalid OTP.");
    }

    setJwt(json.token);
    setOtpModalOpen(false);

    // Step 3: Execute the transaction with JWT
    if (pendingPayload) {
      await execute(pendingPayload, json.token);
      setPendingPayload(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Transfer Funds To Bank</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Funds To Bank</DialogTitle>
        </DialogHeader>

        <BalanceDisplay balance={balance} />
        <QuoteDisplay />

        <form onSubmit={handleSubmit} className="space-y-2">
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
              !quote || !amount || isNaN(Number(amount)) || isLoading || !!data
            }
            className="w-full"
          >
            {isLoading ? "Processing…" : data ? "Done!" : "Withdraw"}
          </Button>
        </form>

        {qL && <p>Loading pricing…</p>}
        {qE && <p className="text-red-600">{qE.message}</p>}
        {error && (
          <p className="text-red-600 mt-2">
            Something went wrong: {error.message}
          </p>
        )}
        {data && (
          <div className="mt-2 p-2 bg-muted border rounded text-sm">
            <p className="text-success font-medium">Success! 🎉</p>
            <p className="break-all font-mono mt-1">{data.tx}</p>
          </div>
        )}
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
