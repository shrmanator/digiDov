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
import { toast } from "@/hooks/use-toast";
import PercentageButtons from "./percentage-buttons";
import { getCharityByWalletAddress } from "@/app/actions/charities";
import CharityKycCheckStep from "../charity-kyb-setup";

interface SendingFundsModalProps {
  charity: {
    wallet_address: string;
    contact_email: string;
  };
}

export default function SendingFundsModal({ charity }: SendingFundsModalProps) {
  const ethBalance = useTotalUsdcBalance(charity.wallet_address);

  // normalize null to 0 for rendering and calculations
  const ethVal = ethBalance ?? 0;
  const totalVal = ethVal;

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
  const [kycDone, setKycDone] = useState(false);

  // Fetch KYC status every time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const record = await getCharityByWalletAddress(charity.wallet_address);
        setKycDone(!!record?.kycCompleted);
      } catch (e) {
        setKycDone(false);
      }
    })();
  }, [isOpen, charity.wallet_address]);

  const reset = () => {
    setIsSendingOtp(false);
    setAmount("");
    setOtpOpen(false);
  };

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Withdrawal Error",
        description: message,
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Verification Error",
        description: message,
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

          {/* KYC Step: Show this until kycDone is true */}
          {!kycDone ? (
            <Card>
              <CardContent className="py-6">
                <CharityKycCheckStep
                  walletAddress={charity.wallet_address}
                  onSuccess={() => setKycDone(true)}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="flex flex-col items-center justify-center space-y-1 py-6">
                  {ethVal > 0 && <div>Funds: ${ethVal.toFixed(6)}</div>}
                  {totalVal === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No USDC balance
                    </div>
                  )}
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
                        setAmount(((totalVal * pct) / 100).toFixed(6))
                      }
                      disabled={isSendingOtp || totalVal === 0}
                    />
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
                        isSendingOtp ||
                        isSendingOnChain ||
                        quoteLoading ||
                        !amount
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
            </>
          )}
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
