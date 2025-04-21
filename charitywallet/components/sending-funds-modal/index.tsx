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
import { Input } from "@/components/ui/input";
import BalanceDisplay from "./balance-display";
import QuoteDisplay from "./quote-display";
import OtpModal from "@/components/opt-modal";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { usePayTrieQuote } from "@/hooks/use-paytrie-quotes";
import {
  usePayTrieTransaction,
  PayTrieTransaction,
} from "@/hooks/use-paytrie-transaction";
import type { TxPayload } from "@/app/types/paytrie-transaction-validation";

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email: string };
}) {
  const [isOpen, setIsOpen] = useState(false);

  // OTP flow
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Pending payload & JWT
  const [pendingPayload, setPendingPayload] = useState<TxPayload | null>(null);

  const balance = useWalletBalance(charity.wallet_address);
  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = usePayTrieQuote();
  const [amount, setAmount] = useState("");

  const { createTransaction, transaction, transactionError, isSubmitting } =
    usePayTrieTransaction();

  // 1️⃣ Send OTP
  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    if (!quote || isSubmitting) return;
    if (isOtpOpen) return;

    const payload: TxPayload = {
      quoteId: quote.id,
      gasId: quote.gasId,
      email: charity.contact_email,
      wallet: charity.wallet_address,
      leftSideLabel: "USDC-POLY",
      leftSideValue: parseFloat(amount),
      rightSideLabel: "CAD",
    };
    setPendingPayload(payload);
    setOtpError("");

    if (!hasSentOtp) {
      try {
        const res = await fetch("/api/paytrie/login-code-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: payload.email }),
        });
        if (!res.ok) throw new Error(await res.text());
        setHasSentOtp(true);
      } catch (err: any) {
        console.error(err);
        setOtpError("Unable to send OTP. Please try again.");
        return;
      }
    }

    setIsOtpOpen(true);
  };

  // 2️⃣ Verify OTP → PayTrie transaction
  const handleOtpVerified = async (otp: string) => {
    setOtpError("");
    try {
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
        throw new Error(json.error || "Invalid OTP");
      }
      setIsOtpOpen(false);

      if (!pendingPayload) throw new Error("Missing transaction details");
      await createTransaction(pendingPayload, json.token);

      // reset for next flow
      setPendingPayload(null);
      setHasSentOtp(false);
    } catch (err: any) {
      console.error(err);
      setOtpError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Withdraw</Button>
      </DialogTrigger>

      <DialogContent style={{ width: "clamp(320px,90vw,480px)" }}>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <BalanceDisplay balance={balance} />
        <QuoteDisplay />

        <form onSubmit={handleWithdraw} className="space-y-4">
          <Input
            type="number"
            step="0.0001"
            min="0"
            placeholder="Amount (USDC‑POLY)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={
              !amount ||
              isNaN(Number(amount)) ||
              quoteLoading ||
              isSubmitting ||
              Boolean(transaction) ||
              isOtpOpen
            }
          >
            {isSubmitting
              ? "Processing…"
              : transaction
              ? "Done!"
              : isOtpOpen
              ? "Awaiting OTP…"
              : "Withdraw"}
          </Button>
        </form>

        {quoteLoading && <p>Loading pricing…</p>}
        {quoteError && <p className="text-red-600">{quoteError.message}</p>}
        {transactionError && (
          <p className="text-red-600">{transactionError.message}</p>
        )}
        {otpError && <p className="text-red-600">OTP Error: {otpError}</p>}

        {transaction && (
          <div className="p-2 bg-muted border rounded text-sm space-y-1">
            <p className="text-success font-medium">Success! 🎉</p>
            <p>
              <strong>TX ID:</strong> {transaction.transactionId}
            </p>
            <p>
              <strong>Rate:</strong> {transaction.exchangeRate}
            </p>
            <p>
              <strong>Send:</strong> {transaction.depositAmount} USDC‑POLY
            </p>
            <p>
              <strong>To address:</strong>
            </p>
            <pre className="font-mono p-1 bg-muted rounded">
              {transaction.depositAddress}
            </pre>
          </div>
        )}
      </DialogContent>

      <OtpModal
        isOpen={isOtpOpen}
        onOpenChange={setIsOtpOpen}
        email={charity.contact_email}
        onVerified={handleOtpVerified}
      />
    </Dialog>
  );
}
