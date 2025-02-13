"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletCopyProps {
  walletAddress: string;
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
      className="flex items-center justify-between p-2 border rounded-md bg-muted cursor-pointer select-all break-words"
      onClick={handleCopy}
    >
      <span className="text-sm font-mono">{walletAddress}</span>
      <Button
        variant="outline"
        className="ml-2 h-8 w-8 p-0"
        onClick={(e) => handleCopy(e)}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
