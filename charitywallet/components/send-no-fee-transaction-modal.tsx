"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Web3 from "web3";
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

// Extend the global Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function TransactionModal() {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<string>("0.0");
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

  // Fetch wallet balance using web3
  useEffect(() => {
    async function fetchBalance() {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            const balanceWei = await web3.eth.getBalance(accounts[0]);
            const balanceEth = web3.utils.fromWei(balanceWei, "ether");
            setBalance(balanceEth);
          }
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      }
    }
    fetchBalance();
  }, []);

  const onSubmit = (data: FormData) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      // Convert the entered amount from ETH to Wei using web3
      const amountWei = web3.utils.toWei(data.amount, "ether");

      // Set recipient and amount for sending
      setRecipient(data.toAddress);
      setAmount(amountWei);

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
