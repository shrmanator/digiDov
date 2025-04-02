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
  charitySlug: string;
  onFinish: () => void;
  onBack: () => void;
}

export function DonationUrlStep({
  charitySlug,
  onFinish,
  onBack,
}: DonationLinkStepProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const donationLink = `${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charitySlug}`;
      await navigator.clipboard.writeText(donationLink);
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
        <div className="flex items-center">
          <DialogTitle>Your Donation Page Link</DialogTitle>
        </div>
        <DialogDescription>
          This link directs donors to your crypto donation page. You can copy
          and share it anywhere&mdash;on your charity&apos;s donation page,
          social media, flyers, etc.&mdash;for donors to support you.
          <br />
          <br />
        </DialogDescription>
      </DialogHeader>

      <div
        className="flex items-center justify-between p-2 border rounded-md bg-muted cursor-pointer select-all sm:flex-nowrap"
        onClick={handleCopy}
      >
        <span className="text-sm font-mono break-all w-0 flex-1">
          {`${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charitySlug}`}
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

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onFinish}>Finish</Button>
      </div>
    </div>
  );
}
