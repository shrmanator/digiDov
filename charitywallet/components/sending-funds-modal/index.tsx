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
  const balance = useTotalUsdcBalance(charity.wallet_address);
  const {
    amount,
    setAmount,
    quoteLoading,
    quoteError,
    exchangeRate,
    initiateWithdraw,
    confirmOtp,
    isSendingOnChain,
  } = usePayTrieOfframp(charity.wallet_address, charity.contact_email);

  const [isOpen, setIsOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const reset = () => {
    setIsSendingOtp(false);
    setAmount("");
    setOtpOpen(false);
  };

  // compute estimated CAD received; convert exchangeRate (string) to number
  const cadEstimate =
    exchangeRate != null && amount
      ? (parseFloat(amount) / parseFloat(exchangeRate)).toFixed(2)
      : null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount) || 0;
    if (amtNum <= 0) {
      toast({ title: "Invalid Amount", description: "Enter a value > 0." });
      return;
    }
    setIsSendingOtp(true);
    try {
      await initiateWithdraw();
      setOtpOpen(true);
    } catch (err: any) {
      toast({
        title: "Withdrawal Error",
        description: err.message || String(err),
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
          "Your withdrawal is confirmed and the on-chain transfer has been sent.",
      });
      setIsOpen(false);
      reset();
    } catch (err: any) {
      toast({
        title: "Verification Error",
        description: err.message || String(err),
        variant: "destructive",
      });
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
            <CardContent className="flex items-center justify-center py-6">
              <BalanceDisplay balance={balance} />
            </CardContent>
          </Card>

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
                  onSelect={(pct) =>
                    balance != null &&
                    setAmount(((balance * pct) / 100).toFixed(6))
                  }
                  disabled={isSendingOtp || balance == null}
                />
                {/* Reserve fixed space; no skeleton shown */}
                <div className="h-5 w-32 text-sm text-muted-foreground flex items-center justify-center">
                  {quoteError && "Error loading conversion"}
                  {!quoteError &&
                    cadEstimate &&
                    `You'll receive ≈ $${cadEstimate} CAD`}
                </div>
                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={
                    isSendingOtp || isSendingOnChain || quoteLoading || !amount
                  }
                >
                  {isSendingOnChain
                    ? "Broadcasting…"
                    : isSendingOtp
                    ? "Sending OTP…"
                    : amount
                    ? `Withdraw $${amount}`
                    : "Withdraw"}
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
