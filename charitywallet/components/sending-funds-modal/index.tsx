"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BellRing, CheckCircle } from "lucide-react";
import { useTransactionFlow } from "@/hooks/use-transaction-flow";
import OtpModal from "../opt-modal";
import BalanceDisplay from "./balance-display";
import PercentageButtons from "./percentage-buttons";
import SendingFundsForm from "./sending-funds-form";
import { useWalletBalance } from "@/hooks/use-wallet-balance";

interface Props {
  charity: {
    wallet_address: string;
    contact_email?: string | null;
  };
}

export default function SendingFundsModal({ charity }: Props) {
  const [open, setOpen] = useState(false);

  const balance = useWalletBalance(charity.wallet_address);

  const {
    register,
    handleSubmit,
    errors,
    setValue,
    submitForm,
    handleOtpVerified,
    isPending,
    isSuccess,
    data,
    otpError,
    isOtpModalOpen,
    setIsOtpModalOpen,
  } = useTransactionFlow(charity.contact_email || "");

  const handleSetPercentage = useCallback(
    (pct: number) => {
      if (balance === null) return;
      const gasBuffer = pct === 100 ? 0.001 : 0;
      const computed = Math.max(0, (balance * pct) / 100 - gasBuffer);
      setValue("amount", computed.toString());
    },
    [balance, setValue]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <ArrowUpRight size={16} />
          Withdraw
        </Button>
      </DialogTrigger>

      <DialogContent style={{ width: "clamp(320px,90vw,480px)" }}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Withdraw Funds
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Transfer crypto to another wallet
          </DialogDescription>
        </DialogHeader>

        {/* Banner */}
        <div className="my-2 border-l-2 border-warning bg-muted p-2 rounded">
          <div className="flex items-start gap-2">
            <BellRing size={14} className="text-warning mt-0.5" />
            <div className="text-xs text-muted-foreground leading-tight">
              <p className="text-sm font-semibold text-warning">
                Bank Transfers Coming Soon
              </p>
              <p className="mt-1">
                Until then, use Coinbase to move crypto to your bank.
              </p>
            </div>
          </div>
        </div>

        <BalanceDisplay balance={balance} />

        <form onSubmit={handleSubmit(submitForm)} className="space-y-2">
          <SendingFundsForm register={register} errors={errors} />

          <PercentageButtons onSelect={handleSetPercentage} />

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || isSuccess}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                Processing
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle size={14} className="text-success" />
                Done
              </span>
            ) : (
              "Withdraw"
            )}
          </Button>
        </form>

        {otpError && (
          <div className="mt-2 p-2 bg-destructive/20 border border-destructive rounded text-xs text-destructive">
            <p className="font-medium">Transaction failed</p>
            <p className="mt-1">{otpError}</p>
          </div>
        )}

        {isSuccess && data && (
          <div className="mt-2 p-2 bg-muted border rounded text-xs">
            <div className="flex items-center gap-1 text-success">
              <CheckCircle size={14} />
              Transaction Submitted
            </div>
            <p className="mt-1 font-mono break-all">{data.transactionHash}</p>
            <p className="text-muted-foreground mt-1">
              You can close this dialog at any time.
            </p>
          </div>
        )}
      </DialogContent>

      {/* OTP */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        email={charity.contact_email || "no email"}
        onVerified={handleOtpVerified}
      />
    </Dialog>
  );
}
