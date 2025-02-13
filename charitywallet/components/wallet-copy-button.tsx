"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletCopyProps {
  walletAddress: string;
}

function truncateWalletAddress(
  address: string,
  startLength = 6,
  endLength = 4
) {
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function WalletCopyButton({ walletAddress }: WalletCopyProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    <div
      onClick={handleCopy}
      className="flex items-center gap-2 cursor-pointer"
    >
      <span className="text-sm font-mono">
        {truncateWalletAddress(walletAddress)}
      </span>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={(e) => handleCopy(e)}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
