"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DonorLinkCopyProps {
  donorLink: string;
  label?: string; // New prop to customize the button text
}

export function DonorLinkCopyButton({
  donorLink,
  label = "Copy Link",
}: DonorLinkCopyProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(donorLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Donation page link copied to clipboard.",
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
    <div
      onClick={handleCopy}
      className="flex items-center gap-2 cursor-pointer"
    >
      <Button variant="outline" className="h-10 px-4 py-2">
        {copied ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {copied ? "Copied!" : label}
      </Button>
    </div>
  );
}
