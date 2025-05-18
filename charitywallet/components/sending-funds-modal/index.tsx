// components/sending-funds-modal/index.tsx

"use client";

import React, { useState } from "react";
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
    initiateWithdraw,
    confirmOtp,
    depositAmount,
    isSendingOnChain,
  } = usePayTrieOfframp(
    charity.wallet_address || "",
    charity.contact_email || ""
  );

  const [isOpen, setIsOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Clean JSON error messages
  const getErrorMessage = (err: any): string => {
    if (err?.message) {
      try {
        const parsed = JSON.parse(err.message);
        return parsed.message || err.message;
      } catch {
        return err.message;
      }
    }
    return String(err);
  };

  const reset = () => {
    setIsSendingOtp(false);
    setAmount("");
    setOtpOpen(false);
  };

  const handleSelectPercent = (percent: number) => {
    if (balance != null) {
      setAmount(((balance * percent) / 100).toFixed(6));
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount) || 0;
    if (amtNum <= 0) {
      toast({ title: "Invalid Amount", description: "Enter an amount > 0." });
      return;
    }
    setIsSendingOtp(true);
    try {
      await initiateWithdraw();
      setOtpOpen(true);
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
            <DialogDescription>
              Funds will be converted to CAD and sent to your bank account.
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardContent>
              <BalanceDisplay balance={balance} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <form onSubmit={handleWithdraw} className="space-y-3">
                <Label htmlFor="amount">Amount To Send</Label>
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
                />

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
                  className="w-full"
                  disabled={isSendingOtp || !amount}
                >
                  {isSendingOtp ? "Sending OTP…" : "Withdraw"}
                </Button>
              </form>
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
