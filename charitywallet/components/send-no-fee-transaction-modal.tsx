"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";
import { useSendCrypto } from "@/hooks/use-send-without-fee";

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

  // ⬇️ Move useSendCrypto to the top of the component (fixes the error)
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<bigint | null>(null);
  const sendCrypto = useSendCrypto(amount ?? BigInt(0), recipient ?? "");

  const onSubmit = (data: FormData) => {
    const amountBigInt = BigInt(ethers.parseEther(data.amount));

    // Set recipient and amount for sending
    setRecipient(data.toAddress);
    setAmount(amountBigInt);

    // Now trigger the send function
    sendCrypto.onClick();

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
