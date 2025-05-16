"use client";
import React, { useState } from "react";
import { usePayTrieOfframp } from "@/hooks/paytrie/use-paytrie-offramp";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTotalUsdcBalance } from "@/hooks/use-total-usdc-balance";
import BalanceDisplay from "./balance-display";
import QuoteDisplay from "./quote-display";
import OtpModal from "@/components/opt-modal";

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email: string };
}) {
  // Always initialize hooks at top to comply with rules-of-hooks
  const balance = useTotalUsdcBalance(charity?.wallet_address || "");
  const {
    amount,
    setAmount,
    quoteLoading,
    quoteError,
    initiateWithdraw,
    confirmOtp,
    transactionId,
    exchangeRate,
    depositAmount,
    isSendingOnChain,
  } = usePayTrieOfframp(
    charity?.wallet_address || "",
    charity?.contact_email || ""
  );
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Then guard required props
  if (!charity?.wallet_address || !charity?.contact_email) {
    console.error("SendingFundsModal: missing required 'charity' prop");
    return null;
  }

  const DEPOSIT_ADDRESS = process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!;

  // Send OTP and open modal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initiateWithdraw();
      setIsOtpOpen(true);
    } catch (err: unknown) {
      console.error(err);
      setOtpError((err as Error).message);
    }
  };

  // Verify OTP, place order, and send on-chain
  const handleOtpVerify = async (code: string) => {
    try {
      await confirmOtp(code);
      setIsOtpOpen(false);
    } catch (err: unknown) {
      setOtpError((err as Error).message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Withdraw</Button>
      </DialogTrigger>

      <DialogContent
        style={{ width: "clamp(320px,90vw,480px)" }}
        aria-describedby="withdraw-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription id="withdraw-dialog-description">
            Enter an amount of USDC-POLY to off-ramp, then follow the OTP
            prompt.
          </DialogDescription>
        </DialogHeader>

        <BalanceDisplay balance={balance} />
        <QuoteDisplay />

        <form onSubmit={handleWithdraw} className="space-y-4">
          <Input
            type="number"
            step="0.000001"
            min="0"
            placeholder="Amount (USDC-POLY)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={!amount || quoteLoading || isSendingOnChain}
          >
            {isSendingOnChain ? "Sending…" : "Withdraw"}
          </Button>
        </form>

        {quoteError && <p className="text-red-600">{quoteError.message}</p>}
        {otpError && <p className="text-red-600">{otpError}</p>}

        {transactionId && (
          <div className="p-2 bg-muted border rounded text-sm space-y-1">
            <p className="text-success font-medium">Success! 🎉</p>
          </div>
        )}

        {depositAmount != null && (
          <div className="p-2 bg-muted border rounded text-sm space-y-1">
            <p>
              <strong>Sent:</strong> {depositAmount} Funds sent to
            </p>
            <pre className="font-mono p-1 bg-muted rounded">
              {DEPOSIT_ADDRESS}
            </pre>
          </div>
        )}
      </DialogContent>

      <OtpModal
        isOpen={isOtpOpen}
        onOpenChange={setIsOtpOpen}
        email={charity.contact_email}
        onVerified={handleOtpVerify}
      />
    </Dialog>
  );
}
