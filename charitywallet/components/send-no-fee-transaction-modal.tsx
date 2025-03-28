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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AccountProvider,
  AccountBalance,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { getWalletBalance } from "thirdweb/wallets";
import { prepareTransaction, toWei } from "thirdweb";
import { polygon, sepolia } from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";
import { ArrowUpRight, AlertCircle, CheckCircle, BellRing } from "lucide-react";

interface SendingFundsModalProps {
  user: { walletAddress: string };
}

export function SendingFundsModal({ user }: SendingFundsModalProps) {
  // State
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(false);
  const [success, setSuccess] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Thirdweb
  const activeAccount = useActiveAccount();
  const { mutate: sendTx, data, isPending, error } = useSendTransaction();

  // Fetch balance
  useEffect(() => {
    async function fetchBalance() {
      if (!user.walletAddress) return;
      try {
        const balanceResponse = await getWalletBalance({
          address: user.walletAddress,
          client: thirdwebClient,
          chain: sepolia,
        });
        const balance = parseFloat(balanceResponse.displayValue || "0");
        setWalletBalance(balance);
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    }
    fetchBalance();
  }, [user.walletAddress]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  }, [closeTimeout]);

  // Percentage setter
  const handleSetPercentage = useCallback(
    (percentage: number) => {
      if (walletBalance === null) return;
      const computedAmount = (walletBalance * percentage) / 100;
      setValue("amount", computedAmount.toString());
    },
    [walletBalance, setValue]
  );

  // Submit handler
  const onSubmit = async (formData: FieldValues) => {
    if (!activeAccount) return;

    setProgress(true);
    setSuccess(false);

    const tx = prepareTransaction({
      to: formData.withdrawalAddress,
      value: toWei(formData.amount),
      chain: polygon,
      client: thirdwebClient,
    });

    sendTx(tx, {
      onSuccess: () => {
        setProgress(false);
        setSuccess(true);
        reset();
        const timeout = setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 10000);
        setCloseTimeout(timeout);
      },
      onError: () => {
        setProgress(false);
        setSuccess(false);
      },
      onSettled: () => {
        setProgress(false);
      },
    });
  };

  // Dialog open/close
  const handleDialogChange = (nextOpen: boolean) => {
    if (progress && !nextOpen) return;
    if (closeTimeout && !nextOpen) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpen(nextOpen);
    if (!nextOpen) setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowUpRight size={16} /> Withdraw
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm bg-neutral-900 text-white p-4 rounded-lg border border-neutral-800 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base">Withdraw Funds</DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Transfer to another wallet
          </DialogDescription>
        </DialogHeader>

        {/* Announcement */}
        <Alert
          variant="default"
          className="mb-2 border-l-2 border-amber-400 bg-neutral-800 p-2"
        >
          <div className="flex items-start gap-2">
            <BellRing className="mt-[2px]" size={14} />
            <div>
              <AlertTitle className="text-sm font-semibold">
                Crypto-to-Bank Transfers Soon!
              </AlertTitle>
              <AlertDescription className="text-xs mt-1 text-neutral-300">
                Until then, use Coinbase to move funds to your bank.
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Balance */}
        <div className="mb-2 p-2 bg-neutral-800 rounded">
          <AccountProvider address={user.walletAddress} client={thirdwebClient}>
            <p className="text-xs text-neutral-400 mb-1">Balance</p>
            <AccountBalance
              chain={sepolia}
              className="text-base font-semibold"
              loadingComponent={
                <span className="animate-pulse">Loading...</span>
              }
            />
          </AccountProvider>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Address */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Recipient Wallet Address
            </label>
            <Input
              {...register("withdrawalAddress", {
                required: "Required",
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: "Invalid address",
                },
              })}
              placeholder="0x..."
              disabled={success}
              className="bg-neutral-800 border-neutral-700 text-xs font-mono"
            />
            {errors.withdrawalAddress && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle size={12} />
                {errors.withdrawalAddress.message as string}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Amount (ETH)
            </label>
            <Input
              {...register("amount", {
                required: "Required",
                pattern: {
                  value: /^[0-9]*[.,]?[0-9]+$/,
                  message: "Invalid number",
                },
              })}
              placeholder="0.0"
              type="text"
              inputMode="decimal"
              disabled={success}
              className="bg-neutral-800 border-neutral-700 text-xs font-mono"
            />
            {errors.amount && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle size={12} />
                {errors.amount.message as string}
              </p>
            )}

            {/* Percentage Buttons */}
            <div className="flex gap-1 mt-2">
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

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending || success}
            className="w-full bg-purple-600 hover:bg-purple-700 text-sm transition-colors"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                Processing
              </span>
            ) : success ? (
              <span className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                Done
              </span>
            ) : (
              "Withdraw"
            )}
          </Button>
        </form>

        {/* Transaction Success */}
        {data && success && (
          <div className="mt-2 p-2 bg-neutral-800 border border-neutral-700 rounded text-xs">
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={14} />
              Transaction submitted
            </div>
            <p className="mt-1 font-mono break-all">{data.transactionHash}</p>
            <p className="text-neutral-400 mt-1">Closing in 10s...</p>
          </div>
        )}

        {/* Transaction Error */}
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
