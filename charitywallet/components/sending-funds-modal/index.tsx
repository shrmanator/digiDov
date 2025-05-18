// components/sending-funds-modal/index.tsx

"use client";

import React, { useState, useEffect } from "react";
import OtpModal from "../opt-modal";
import { usePayTrieOfframp } from "@/hooks/paytrie/use-paytrie-offramp";
import { useTotalUsdcBalance } from "@/hooks/use-total-usdc-balance";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import BalanceDisplay from "./balance-display";
import { toast } from "@/hooks/use-toast";
import PercentageButtons from "./percentage-buttons";

interface SendingFundsModalProps {
  charity: {
    wallet_address: string;
    contact_email: string;
  };
}

export default function SendingFundsModal({ charity }: SendingFundsModalProps) {
  const balance = useTotalUsdcBalance(charity.wallet_address || "");
  const {
    amount,
    setAmount,
    quoteLoading,
    quoteError,
    exchangeRate,
    initiateWithdraw, // we won’t use this in dev-skip
    confirmOtp,
    depositAmount,
    isSendingOnChain,
  } = usePayTrieOfframp(
    charity.wallet_address || "",
    charity.contact_email || ""
  );

  // DEBUG: logs
  useEffect(() => {
    console.log("→ depositAmount:", depositAmount);
    console.log("→ isSendingOnChain:", isSendingOnChain);
  }, [depositAmount, isSendingOnChain]);

  const [isOpen, setIsOpen] = useState(false);
  // OTP modal never actually opens in dev-skip
  const [otpOpen, setOtpOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const getErrorMessage = (err: any): string =>
    err?.message
      ? (() => {
          try {
            return JSON.parse(err.message).message;
          } catch {
            return err.message;
          }
        })()
      : String(err);

  const reset = () => {
    setIsSendingOtp(false);
    setAmount("");
    setOtpOpen(false);
  };

  const handleSelectPercent = (pct: number) => {
    if (balance != null) setAmount(((balance * pct) / 100).toFixed(6));
  };

  // ← Dev-skip: bypass OTP, call confirmOtp immediately
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount) || 0;
    if (amtNum <= 0) {
      toast({ title: "Invalid Amount", description: "Enter an amount > 0." });
      return;
    }
    setIsSendingOtp(true);
    try {
      // immediately call confirmOtp (no OTP needed)
      await confirmOtp("");
    } catch (err: any) {
      toast({
        title: "Withdrawal Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    // not used in dev-skip
    try {
      await confirmOtp(otp);
      setOtpOpen(false);
      toast({
        title: "Withdrawal Successful!",
        description:
          "Your withdrawal is being processed and funds will be sent to your bank shortly.",
      });
      setIsOpen(false);
      reset();
    } catch (err: any) {
      toast({
        title: "Verification Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
      throw err;
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
        <DialogContent className="max-w-md space-y-4">
          <DialogHeader>
            <DialogTitle>Send Funds to Bank</DialogTitle>
            <DialogDescription>DEV MODE: OTP skipped</DialogDescription>
          </DialogHeader>

          {/* Balance */}
          <Card>
            <CardContent className="flex items-center justify-center py-6">
              <BalanceDisplay balance={balance} />
            </CardContent>
          </Card>

          {/* Amount Form */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <form onSubmit={handleWithdraw} className="w-full space-y-3">
                <Label htmlFor="amount">Amount To Send</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^\d.]/g, ""))
                    }
                    disabled={isSendingOtp}
                    required
                    className="pl-7 h-10 w-full"
                  />
                </div>
                <PercentageButtons
                  onSelect={handleSelectPercent}
                  disabled={isSendingOtp || balance == null}
                />
                <div className="text-sm text-muted-foreground">
                  {quoteError
                    ? "Error loading rate"
                    : quoteLoading
                    ? "Loading rate…"
                    : exchangeRate != null
                    ? `1 CAD ≈ ${exchangeRate} USD`
                    : null}
                </div>
                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isSendingOtp || isSendingOnChain || !amount}
                >
                  {isSendingOnChain
                    ? "Broadcasting…"
                    : isSendingOtp
                    ? "Processing…"
                    : amount
                    ? `Withdraw $${amount}`
                    : "Withdraw"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* OTP modal remains, but never opens in dev-skip */}
      <OtpModal
        isOpen={otpOpen}
        onOpenChange={setOtpOpen}
        email={charity.contact_email}
        onVerified={handleOtpVerify}
      />
    </>
  );
}
