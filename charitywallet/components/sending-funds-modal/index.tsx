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
import OtpModal from "../opt-modal";
import PercentageButtons from "./percentage-buttons";

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
  const [otpOpen, setOtpOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string>("");

  const reset = () => {
    setOtpOpen(false);
    setError("");
    setAmount("");
    setIsSendingOtp(false);
  };

  const handleSelectPercent = (percent: number) => {
    if (balance != null) {
      const calculated = ((balance * percent) / 100).toFixed(6);
      setAmount(calculated);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSendingOtp(true);
    try {
      await initiateWithdraw();
      setIsSendingOtp(false);
      setOtpOpen(true);
    } catch (err: any) {
      setError(err.message);
      setIsSendingOtp(false);
    }
  };

  // new handler for OTP verification
  const handleOtpVerify = async (otp: string) => {
    setError("");
    try {
      await confirmOtp(otp);
      setOtpOpen(false);
    } catch (err: any) {
      setError(err.message);
      throw err; // let OtpModal show inline error
    }
  };

  return (
    <>
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

          <Card>
            <CardContent className="p-4 space-y-1">
              <BalanceDisplay balance={balance} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              {!transactionId ? (
                <form onSubmit={handleWithdraw} className="space-y-2">
                  <Label htmlFor="amount">Amount To Send</Label>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    required
                    disabled={quoteLoading || isSendingOtp}
                  />
                  <PercentageButtons
                    onSelect={handleSelectPercent}
                    disabled={quoteLoading || isSendingOtp || balance == null}
                  />
                  <div className="flex items-center text-sm text-muted-foreground">
                    {quoteError
                      ? "Error loading rate"
                      : quoteLoading
                      ? "Loading rate…"
                      : exchangeRate != null
                      ? `1 CAD ≈ ${Number(exchangeRate).toFixed(4)} USD`
                      : null}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={quoteLoading || isSendingOtp || !amount}
                  >
                    {quoteLoading || isSendingOtp ? "Sending OTP…" : "Withdraw"}
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
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    {depositAmount != null
                      ? `${depositAmount} will be converted to CAD and sent to your bank account. For questions: contact@digidov.com`
                      : "Your withdrawal is in progress."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <OtpModal
        isOpen={otpOpen}
        onOpenChange={setOtpOpen}
        email={charity.contact_email}
        onVerified={handleOtpVerify}
      />
    </>
  );
}
