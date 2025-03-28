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
import { prepareTransaction, toWei } from "thirdweb";
import { polygon, sepolia } from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";
import { ArrowUpRight, BellRing, AlertCircle, CheckCircle } from "lucide-react";

interface SendingFundsModalProps {
  user: { walletAddress: string };
}

export function SendingFundsModal({ user }: SendingFundsModalProps) {
  const [open, setOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const activeAccount = useActiveAccount();

  const {
    mutate: sendTx,
    data,
    isPending,
    error,
    isSuccess,
  } = useSendTransaction();

  // Fetch wallet balance
  useEffect(() => {
    async function fetchBalance() {
      if (!user.walletAddress) return;
      try {
        const balanceResponse = await getWalletBalance({
          address: user.walletAddress,
          client: thirdwebClient,
          chain: sepolia,
        });
        setWalletBalance(parseFloat(balanceResponse.displayValue || "0"));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    }
    fetchBalance();
  }, [user.walletAddress]);

  // Helper to set amount based on percentage
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

  // Submit form
  const onSubmit = (formData: FieldValues) => {
    if (!activeAccount) return;

    const tx = prepareTransaction({
      to: formData.recipientAddress,
      value: toWei(formData.amount),
      chain: polygon,
      client: thirdwebClient,
    });

    sendTx(tx, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <ArrowUpRight size={16} />
          Withdraw
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-neutral-900 text-white p-4 rounded-lg border border-neutral-800 shadow-xl"
        style={{ width: "clamp(320px, 90vw, 480px)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Withdraw Funds
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Transfer crypto to another wallet
          </DialogDescription>
        </DialogHeader>

        {/* IMPORTANT NOTE (pinned banner) */}
        <div className="my-2 border-l-2 border-amber-400 bg-neutral-800 p-2 rounded">
          <div className="flex items-start gap-2">
            <BellRing size={14} className="text-amber-400 mt-0.5" />
            <div className="text-xs text-neutral-300 leading-tight">
              <p className="text-sm font-semibold text-amber-200">
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
          <label className="block text-xs text-neutral-500 mb-1">
            Your Balance (ETH)
          </label>
          <div className="bg-neutral-800 p-2 rounded font-semibold text-base">
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
              disabled={isSuccess}
              className="bg-neutral-800 border-neutral-700 text-xs font-mono"
            />
            {errors.recipientAddress && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
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
              disabled={isSuccess}
              className="bg-neutral-800 border-neutral-700 text-xs font-mono"
            />
            {errors.amount && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
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
            disabled={isPending || isSuccess}
            className="w-full bg-purple-600 hover:bg-purple-700 text-sm transition-colors"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                Processing
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                Done
              </span>
            ) : (
              "Withdraw"
            )}
          </Button>
        </form>

        {/* Success or Error Messages */}
        {isSuccess && data && (
          <div className="mt-2 p-2 bg-neutral-800 border border-neutral-700 rounded text-xs">
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={14} />
              Transaction Submitted
            </div>
            <p className="mt-1 font-mono break-all">{data.transactionHash}</p>
            <p className="text-neutral-400 mt-1">
              You can close this dialog at any time.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-400 rounded text-xs text-red-100">
            <p className="font-medium">Transaction failed</p>
            <p className="mt-1">{error.message}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
