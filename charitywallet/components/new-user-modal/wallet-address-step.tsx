"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DonationLinkStepProps {
  charityName: string;
  onFinish: () => void;
}

export function DonationLinkStep({
  charityName,
  onFinish,
}: DonationLinkStepProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charityName}`
      );
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Donation link copied to clipboard.",
        variant: "default",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy donation link.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <DialogHeader>
        <DialogTitle>Your Donation Wallet</DialogTitle>
        <DialogDescription>
          This is your unique donation link for receiving crypto donations. You
          can copy and share it anywhere—on flyers, your website, social media,
          etc.—to invite donors to support you.
          <br />
          <br />
          Currently, we only support tax receipts for POL, but we will be adding
          support for ETH and many other currencies soon.
        </DialogDescription>
      </DialogHeader>

      <div
        className="flex items-center justify-between p-2 border rounded-md bg-muted cursor-pointer select-all sm:flex-nowrap"
        onClick={handleCopy}
      >
        {/* 
          w-0 flex-1 ensures the span can shrink or grow as needed.
          break-all allows the link to wrap onto multiple lines if needed.
        */}
        <span className="text-sm font-mono break-all w-0 flex-1">
          {`${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charityName}`}
        </span>
        <Button
          variant="outline"
          className="ml-2 h-8 w-8 p-0 flex-shrink-0"
          onClick={(e) => handleCopy(e)}
        >
          {copied ? (
            <Check className="h-4 w-4" />
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
