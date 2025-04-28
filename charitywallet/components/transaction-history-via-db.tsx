"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DonationReceipt } from "@/app/types/receipt";

// Map of blockchain chainId to display name and symbol
const CHAIN_MAP: Record<string, { symbol: string; name: string }> = {
  "0x1": { symbol: "ETH", name: "Ethereum" },
  "0x89": { symbol: "POL", name: "Polygon" },
};

interface DonationHistoryProps {
  receipts: DonationReceipt[];
  donationLink?: string;
}

function CopyButtonInner({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <span className="text-green-500">✓</span>
            ) : (
              <Copy size={14} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diff < minute) return "just now";
  if (diff < hour)
    return `${Math.floor(diff / minute)} minute${
      Math.floor(diff / minute) > 1 ? "s" : ""
    } ago`;
  if (diff < day)
    return `${Math.floor(diff / hour)} hour${
      Math.floor(diff / hour) > 1 ? "s" : ""
    } ago`;
  if (diff < week)
    return `${Math.floor(diff / day)} day${
      Math.floor(diff / day) > 1 ? "s" : ""
    } ago`;
  if (diff < month)
    return `${Math.floor(diff / week)} week${
      Math.floor(diff / week) > 1 ? "s" : ""
    } ago`;
  if (diff < year)
    return `${Math.floor(diff / month)} month${
      Math.floor(diff / month) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(diff / year)} year${
    Math.floor(diff / year) > 1 ? "s" : ""
  } ago`;
}

function DonationReceiptItem({ receipt }: { receipt: DonationReceipt }) {
  const dateTs = new Date(receipt.donation_date).getTime();
  const relativeTime = getRelativeTime(dateTs);
  const formattedDate = new Date(receipt.donation_date).toLocaleString();

  const donorName = receipt.donor
    ? `${receipt.donor.first_name} ${receipt.donor.last_name}`
    : "Anonymous Donor";
  const donorEmail = receipt.donor?.email;

  const chainInfo =
    receipt.chainId && CHAIN_MAP[receipt.chainId]
      ? CHAIN_MAP[receipt.chainId]
      : { symbol: "", name: "Unknown Chain" };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 w-full">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted">
                <User size={16} />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{donorName}</CardTitle>
              {donorEmail && (
                <CardDescription className="text-xs">
                  {donorEmail}
                </CardDescription>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {chainInfo.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-lg">
            ${receipt.fiat_amount.toFixed(3)}
          </span>
        </div>
        <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{relativeTime}</span>
            <span className="text-muted-foreground/60">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono">
              {receipt.transaction_hash.slice(0, 6)}...
              {receipt.transaction_hash.slice(-4)}
            </span>
            <CopyButtonInner text={receipt.transaction_hash} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DonationHistory({
  receipts,
  donationLink,
}: DonationHistoryProps) {
  const [linkCopied, setLinkCopied] = React.useState(false);
  const handleCopyLink = () => {
    if (!donationLink) return;
    navigator.clipboard.writeText(donationLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (!receipts.length) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="text-4xl opacity-20 mb-4">💸</div>
          <p className="text-center text-muted-foreground mb-4">
            No donation receipts found.
          </p>
          {donationLink && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-sm">
                Place this link where you want to accept donations.
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={handleCopyLink}
                      className="w-full max-w-sm flex items-center justify-center border border-border rounded px-4 py-2 cursor-pointer hover:bg-muted/10"
                    >
                      <div className="flex-none w-4 h-4 flex items-center justify-center mr-2">
                        {linkCopied ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <Copy size={14} />
                        )}
                      </div>
                      <span className="font-mono break-all text-sm">
                        {donationLink}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{linkCopied ? "Link copied!" : "Click to copy link"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const sortedReceipts = [...receipts].sort(
    (a, b) =>
      new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime()
  );

  return (
    <ScrollArea style={{ height: "70vh" }} className="w-full">
      <div className="space-y-4 pr-4 w-full">
        {sortedReceipts.map((receipt) => (
          <DonationReceiptItem key={receipt.id} receipt={receipt} />
        ))}
      </div>
    </ScrollArea>
  );
}
