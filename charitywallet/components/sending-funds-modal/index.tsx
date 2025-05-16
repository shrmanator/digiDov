"use client";

import React, { useState } from "react";
import { usePayTrieOfframp } from "@/hooks/paytrie/use-paytrie-offramp";
import { useTotalUsdcBalance } from "@/hooks/use-total-usdc-balance";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import BalanceDisplay from "./balance-display";

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email: string };
}) {
  const balance = useTotalUsdcBalance(charity.wallet_address || "");
  const {
    amount,
    setAmount,
    quoteLoading,
    quoteError,
    exchangeRate,
    initiateWithdraw,
    confirmOtp,
    transactionId,
    depositAmount,
    isSendingOnChain,
  } = usePayTrieOfframp(
    charity.wallet_address || "",
    charity.contact_email || ""
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isOtpPhase, setIsOtpPhase] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string>("");

  const reset = () => {
    setIsOtpPhase(false);
    setOtpCode("");
    setError("");
    setAmount("");
    setIsSendingOtp(false);
  };

  const handleMax = () => {
    if (balance != null) setAmount(balance.toString());
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSendingOtp(true);
    try {
      await initiateWithdraw();
      setIsOtpPhase(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await confirmOtp(otpCode);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Withdraw</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md space-y-3">
        <DialogHeader>
          <DialogTitle>Send Funds to Bank</DialogTitle>
          <DialogDescription>
            Funds will be converted to CAD and sent to your bank account.
          </DialogDescription>
        </DialogHeader>

        {/* Balance & Rate */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <BalanceDisplay balance={balance} />
          </CardContent>
        </Card>

        {/* Form or Success */}
        <Card>
          <CardContent className="p-4 space-y-2">
            {!transactionId ? (
              <form
                onSubmit={isOtpPhase ? handleVerify : handleWithdraw}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  {!isOtpPhase && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handleMax}
                    >
                      Max
                    </Button>
                  )}
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={quoteLoading || isOtpPhase || isSendingOtp}
                />

                <div className="flex items-center text-sm text-muted-foreground">
                  {quoteError
                    ? "Error loading rate"
                    : quoteLoading
                    ? "Loading rate…"
                    : exchangeRate != null
                    ? `1 CAD ≈ ${Number(exchangeRate).toFixed(4)} USD`
                    : null}
                </div>

                {isOtpPhase && (
                  <div className="space-y-1 p-4 bg-muted rounded-lg border border-primary">
                    <Label htmlFor="otp">
                      Enter the 6-digit code sent to your email
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      autoFocus
                      className="ring-2 ring-primary"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    quoteLoading ||
                    isSendingOtp ||
                    (!isOtpPhase && !amount) ||
                    (isOtpPhase && otpCode.length < 6)
                  }
                >
                  {isSendingOnChain
                    ? "Processing…"
                    : isOtpPhase
                    ? "Send Funds to Bank"
                    : isSendingOtp
                    ? "Sending OTP…"
                    : "Withdraw"}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </form>
            ) : (
              <Alert variant="default">
                <AlertTitle>Success! 🎉</AlertTitle>
                <AlertDescription>
                  {depositAmount != null
                    ? `$${depositAmount} sent to your bank`
                    : "Your withdrawal is in progress."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
