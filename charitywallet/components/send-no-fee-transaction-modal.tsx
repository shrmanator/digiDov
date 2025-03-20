"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AccountBalance,
  AccountProvider,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { polygon, sepolia } from "thirdweb/chains";
import { prepareTransaction, toWei } from "thirdweb";
import { client as thirdwebClient } from "@/lib/thirdwebClient";
import { ArrowUpRight, AlertCircle, CheckCircle } from "lucide-react";

interface SendingFundsModalProps {
  user: { walletAddress: string };
}

interface FormData {
  withdrawalAddress: string;
  amount: string;
}

export function SendingFundsModal({ user }: SendingFundsModalProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // Get the active account using thirdweb's hook
  const activeAccount = useActiveAccount();

  // Get the send transaction mutation hook
  const {
    mutate: sendTx,
    data: transactionResult,
    isPending,
    error,
  } = useSendTransaction();

  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  const onSubmit = (data: FormData) => {
    if (!activeAccount) {
      console.error("No wallet connected.");
      return;
    }

    setIsTransactionInProgress(true);
    setTransactionSuccess(false);

    // Prepare the transaction using thirdweb utilities:
    const transaction = prepareTransaction({
      to: data.withdrawalAddress,
      value: toWei(data.amount), // converts ETH amount (as string) to Wei
      chain: polygon,
      client: thirdwebClient,
    });

    // Trigger the transaction
    sendTx(transaction, {
      onSuccess: () => {
        setIsTransactionInProgress(false);
        setTransactionSuccess(true);
        reset();

        // Set a timeout to close the modal after 10 seconds
        const timeout = setTimeout(() => {
          setOpen(false);
          setTransactionSuccess(false);
        }, 10000);

        setCloseTimeout(timeout);
      },
      onError: () => {
        setIsTransactionInProgress(false);
        setTransactionSuccess(false);
      },
      onSettled: () => {
        setIsTransactionInProgress(false);
      },
    });
  };

  // Handle manual dialog close
  const handleDialogChange = (newOpen: boolean) => {
    // Only allow closing if no transaction is in progress
    if (isTransactionInProgress && newOpen === false) {
      return;
    }

    // Clear any pending timeouts when manually closing
    if (closeTimeout && !newOpen) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }

    setOpen(newOpen);

    // Reset transaction success state when closing
    if (!newOpen) {
      setTransactionSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowUpRight size={16} />
          <span>Withdraw Funds</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Withdraw funds to another wallet address.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 bg-muted rounded-md">
          <AccountProvider address={user.walletAddress} client={thirdwebClient}>
            <div className="text-sm text-muted-foreground mb-1">
              Available Balance
            </div>
            <AccountBalance
              chain={sepolia}
              className="text-lg font-semibold"
              loadingComponent={
                <span className="animate-pulse">Loading balance...</span>
              }
            />
          </AccountProvider>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Withdrawal Address</label>
            <Input
              {...register("withdrawalAddress", {
                required: "Withdrawal address is required",
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: "Please enter a valid Ethereum address",
                },
              })}
              placeholder="0x..."
              className="font-mono text-sm"
              disabled={transactionSuccess}
            />
            {errors.withdrawalAddress && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                <span>{errors.withdrawalAddress.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (ETH)</label>
            <Input
              {...register("amount", {
                required: "Amount is required",
                pattern: {
                  value: /^[0-9]*[.,]?[0-9]+$/,
                  message: "Please enter a valid number",
                },
              })}
              placeholder="0.0"
              type="text"
              inputMode="decimal"
              disabled={transactionSuccess}
            />
            {errors.amount && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                <span>{errors.amount.message}</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || transactionSuccess}
            className="w-full"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                Processing...
              </span>
            ) : transactionSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-primary" />
                Transaction Successful
              </span>
            ) : (
              "Withdraw Funds"
            )}
          </Button>

          {transactionResult && transactionSuccess && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md text-sm">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle size={16} />
                <p className="font-medium">
                  Transaction submitted successfully!
                </p>
              </div>
              <p className="mt-2 text-xs font-mono break-all text-foreground">
                Hash: {transactionResult.transactionHash}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                This dialog will close automatically in 10 seconds...
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border rounded text-destructive text-sm">
              <p className="font-medium">Transaction failed</p>
              <p className="mt-1 text-xs">{error.message}</p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
