"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendCrypto } from "@/hooks/use-send-without-fee";
import { AccountBalance, AccountProvider } from "thirdweb/react";
import { ethereum } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";

interface FormData {
  toAddress: string;
  amount: string;
}

export function TransactionModal() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // State for transaction parameters
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("0");
  const sendCrypto = useSendCrypto(BigInt(amount), recipient ?? "");

  const onSubmit = (data: FormData) => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      // Convert the ETH amount to Wei using ethers.parseEther (v6)
      const amountWei = ethers.parseEther(data.amount);
      // Set recipient and amount for sending
      setRecipient(data.toAddress);
      setAmount(amountWei.toString());
      // Trigger the send function from your custom hook
      sendCrypto.onClick();
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Send Crypto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Cryptocurrency</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <AccountProvider
            address="0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
            client={client}
          >
            <AccountBalance
              chain={ethereum}
              loadingComponent={<span>Loading...</span>}
            />
          </AccountProvider>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Recipient Address</label>
            <Input
              {...register("toAddress", {
                required: "Recipient address is required.",
              })}
              placeholder="0xRecipientAddress"
            />
            {errors.toAddress && (
              <p className="text-sm text-red-500">{errors.toAddress.message}</p>
            )}
          </div>
          <div>
            <label>Amount (ETH)</label>
            <Input
              {...register("amount", { required: "Amount is required." })}
              placeholder="0.0"
              type="number"
              step="any"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>
          <Button type="submit">Send</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
