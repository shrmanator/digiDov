"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";
// Adjust the import path to your toast hook implementation.
import { useToast } from "@/hooks/use-toast";

interface WalletAddressStepProps {
  walletAddress: string;
  onFinish: () => void;
}

export function WalletAddressStep({
  walletAddress,
  onFinish,
}: WalletAddressStepProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard.",
        variant: "default",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy wallet address.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Organization Setup Complete</DialogTitle>
        <DialogDescription>
          This is your wallet address. Please add this to your organization
          site.
        </DialogDescription>
      </DialogHeader>
      {/* The container is clickable */}
      <div
        className="flex items-center justify-center p-2 border rounded-md bg-muted cursor-pointer"
        onClick={handleCopy}
      >
        <span className="text-sm font-mono select-all break-words">
          {walletAddress}
        </span>
        {/* The copy button stops propagation so that clicking it doesn't trigger the container's onClick twice */}
        <Button
          variant="outline"
          className="ml-2 h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex justify-end">
        <Button onClick={onFinish}>Finish</Button>
      </div>
    </div>
  );
}
