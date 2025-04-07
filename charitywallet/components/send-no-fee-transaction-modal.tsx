"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, FieldValues } from "react-hook-form";
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
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getWalletBalance } from "thirdweb/wallets";
import { PreparedTransaction, prepareTransaction, toWei } from "thirdweb";
import { polygon, sepolia } from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";
import { ArrowUpRight, BellRing, AlertCircle, CheckCircle } from "lucide-react";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/otp";
import OtpModal from "./opt-modal";

interface SendingFundsModalProps {
  charity: {
    wallet_address: string;
    contact_email?: string | null;
  };
}

export function SendingFundsModal({ charity }: SendingFundsModalProps) {
  const [open, setOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [pendingTx, setPendingTx] = useState<PreparedTransaction | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [methodId, setMethodId] = useState("");
  const [otpError, setOtpError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const activeAccount = useActiveAccount();
  const { mutate: sendTx, data, isPending, isSuccess } = useSendTransaction();

  // Fetch wallet balance using charity.wallet_address
  useEffect(() => {
    async function fetchBalance() {
      console.log("Fetching balance for charity:", charity);
      if (!charity.wallet_address) return;
      try {
        const balanceResponse = await getWalletBalance({
          address: charity.wallet_address,
          client: thirdwebClient,
          chain: sepolia,
        });
        setWalletBalance(parseFloat(balanceResponse.displayValue || "0"));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    }
    fetchBalance();
  }, [charity.wallet_address]);

  // Helper to set amount based on percentage.
  const handleSetPercentage = useCallback(
    (percentage: number) => {
      if (walletBalance === null) return;
      const gasBuffer = percentage === 100 ? 0.001 : 0;
      const computedAmount = Math.max(
        0,
        (walletBalance * percentage) / 100 - gasBuffer
      );
      setValue("amount", computedAmount.toString());
    },
    [walletBalance, setValue]
  );

  // Instead of sending the transaction immediately,
  // store the transaction details and trigger OTP flow.

  const onSubmit = (formData: FieldValues) => {
    if (!activeAccount) return;

    // Prepare the transaction.
    const tx = prepareTransaction({
      to: formData.recipientAddress,
      value: toWei(formData.amount),
      chain: polygon,
      client: thirdwebClient,
    });

    // Store the pending transaction.
    setPendingTx(tx);

    // Use the charity's email for OTP.
    const otpEmail = charity.contact_email || "";
    if (!otpEmail) {
      console.error("No email provided for OTP.");
      return;
    }

    // Send OTP.
    sendOtpAction(otpEmail)
      .then((response) => {
        if (response?.email_id) {
          setMethodId(response.email_id);
          setIsOtpModalOpen(true);
        } else if (response?.error_message) {
          setOtpError(response.error_message);
        } else {
          console.error("Failed to send OTP.");
        }
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
        setOtpError("Unable to send OTP, please try again later.");
      });
  };

  // This function is called when the OTP modal returns the OTP code.
  // It performs a backend OTP verification and, if successful, sends the transaction.
  const handleOtpVerified = async (otp: string) => {
    setOtpError("");

    try {
      const verification = await verifyOtpAction(methodId, otp);
      if (verification.status_code !== 200) {
        setOtpError("Too many requests. Please wait a moment and try again.");
        return;
      }
    } catch {
      setOtpError("Too many requests. Please wait a moment and try again.");
      return;
    }

    setIsOtpModalOpen(false);

    if (pendingTx) {
      sendTx(pendingTx, {
        onSuccess: () => {
          reset();
        },
      });
      setPendingTx(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <ArrowUpRight size={16} />
          Withdraw
        </Button>
      </DialogTrigger>

      <DialogContent style={{ width: "clamp(320px, 90vw, 480px)" }}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Withdraw Funds
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Transfer crypto to another wallet
          </DialogDescription>
        </DialogHeader>

        {/* Pinned Banner */}
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

        {/* Your Balance */}
        <div className="mb-2">
          <label className="block text-xs text-muted-foreground mb-1">
            Your Balance (ETH)
          </label>
          <div className="bg-muted p-2 rounded font-semibold text-base">
            {walletBalance !== null ? walletBalance.toFixed(4) : "Loading..."}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Recipient Address */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Recipient Wallet Address
            </label>
            <Input
              {...register("recipientAddress", {
                required: "Recipient address is required",
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: "Invalid address (0x + 40 hex chars)",
                },
              })}
              placeholder="0x..."
              className="font-mono"
            />
            {errors.recipientAddress && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle size={12} />
                {errors.recipientAddress.message as string}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Amount to Send (ETH)
            </label>
            <Input
              {...register("amount", {
                required: "Amount is required",
                pattern: {
                  value: /^[0-9]*[.,]?[0-9]+$/,
                  message: "Invalid number format",
                },
              })}
              placeholder="0.00"
              type="text"
              inputMode="decimal"
              className="font-mono"
            />
            {errors.amount && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle size={12} />
                {errors.amount.message as string}
              </p>
            )}

            {/* Percentage Buttons */}
            <div className="flex gap-2 mt-2">
              {[
                { label: "25%", value: 25 },
                { label: "50%", value: 50 },
                { label: "75%", value: 75 },
                { label: "Max", value: 100 },
              ].map((btn) => (
                <Button
                  key={btn.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSetPercentage(btn.value)}
                  className="px-2"
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
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

      {/* OTP Modal for extra security */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        email={charity.contact_email || "no email"}
        onVerified={handleOtpVerified}
      />
    </Dialog>
  );
}
