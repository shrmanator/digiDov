"use client";

import { useState, useEffect } from "react";
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

interface FormData {
  toAddress: string;
  amount: string;
}

export function TransactionModal() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState("0.0");

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

  // Fetch wallet balance using ethers v6
  useEffect(() => {
    async function fetchBalance() {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          // Create an ethers provider using BrowserProvider (ethers v6)
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          // Request account access
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balanceBigInt = await provider.getBalance(address);
          // Format the balance using the standalone formatEther function
          const formattedBalance = ethers.formatEther(balanceBigInt);
          setBalance(formattedBalance);
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      }
    }
    fetchBalance();
  }, []);

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
        {/* Display the current wallet balance */}
        <div className="mb-4">
          <p>
            <strong>Wallet Balance:</strong> {balance} ETH
          </p>
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
