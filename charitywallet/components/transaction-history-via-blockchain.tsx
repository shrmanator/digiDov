"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, Copy, User } from "lucide-react";
import { DonationEvent } from "@/utils/fetch-contract-transactions";
import { DonationReceipt } from "@/app/types/receipt";
import { useHistoricalPrice } from "@/hooks/use-historical-crypto-price";
import Web3 from "web3";
import { CopyButton } from "./copy-button";

const web3 = new Web3();

interface DonationHistoryProps {
  donations: DonationEvent[];
  receipts?: DonationReceipt[];
  donationLink?: string; // new prop for the donation link
}

// Mapping for cryptocurrency symbols by chain ID
const CHAIN_MAP = {
  1: { hex: "0x1", symbol: "ETH", name: "Ethereum" },
  137: { hex: "0x89", symbol: "POL", name: "Polygon" },
  // other chains...
};

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

function DonationCard({
  donation,
  receipt,
}: {
  donation: DonationEvent;
  receipt?: DonationReceipt;
}) {
  const nativeValue = web3.utils.fromWei(donation.netAmount, "ether");
  const chainInfo = CHAIN_MAP[donation.chain as keyof typeof CHAIN_MAP] || {
    symbol: "CRYPTO",
    name: "Unknown",
  };
  const chainSymbol = chainInfo.symbol;

  // Format wallet address for display
  const formattedAddress = `${donation.donor.slice(
    0,
    6
  )}...${donation.donor.slice(-4)}`;

  // Get historical price
  const chainHex = CHAIN_MAP[donation.chain as keyof typeof CHAIN_MAP]?.hex;
  const historicalPrice = useHistoricalPrice(
    chainHex,
    new Date(donation.timestamp.raw).toISOString(),
    "usd"
  );
  // Calculate USD value
  const usdValue =
    historicalPrice && !isNaN(parseFloat(nativeValue))
      ? parseFloat(nativeValue) * historicalPrice
      : 0;

  // Format relative time without dependencies
  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    if (diff < minute) {
      return "just now";
    } else if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diff < week) {
      const days = Math.floor(diff / day);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (diff < month) {
      const weeks = Math.floor(diff / week);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (diff < year) {
      const months = Math.floor(diff / month);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diff / year);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  const relativeTime = getRelativeTime(donation.timestamp.raw);

  // Get donor initials for avatar fallback
  const getInitials = () => {
    if (receipt?.donor?.first_name && receipt?.donor?.last_name) {
      return `${receipt.donor.first_name[0]}${receipt.donor.last_name[0]}`.toUpperCase();
    }
    return "?";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {receipt?.donor ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            )}

            <div>
              <CardTitle className="text-base">
                {receipt?.donor
                  ? `${receipt.donor.first_name} ${receipt.donor.last_name}`
                  : "Anonymous Donor"}
              </CardTitle>
              {receipt?.donor?.email && (
                <CardDescription className="text-xs">
                  {receipt.donor.email}
                </CardDescription>
              )}
            </div>
          </div>

          <Badge variant="outline" className="flex items-center gap-1">
            {chainInfo.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowDown size={16} className="text-green-500" />
          <span className="font-bold text-lg">${usdValue.toFixed(2)}</span>
          <span className="text-muted-foreground text-sm">
            ({parseFloat(nativeValue).toFixed(4)} {chainSymbol})
          </span>
        </div>

        <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{relativeTime}</span>
            <span className="text-muted-foreground/60">
              {donation.timestamp.formatted}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>{formattedAddress}</span>
            <CopyButtonInner text={donation.donor} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DonationHistory({
  donations,
  receipts = [],
  donationLink,
}: DonationHistoryProps) {
  if (!donations.length) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="text-4xl opacity-20 mb-4">💸</div>
          <p className="text-center text-muted-foreground">No donations yet</p>
          {donationLink && (
            <>
              <p className="text-center mt-4 text-sm">
                Paste this link where you want to accept donations.
              </p>
              <div className="mt-2">
                <CopyButton text={donationLink} label={donationLink} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Create a map of receipts for easy lookup
  const receiptMap = new Map<string, DonationReceipt>();
  receipts.forEach((receipt) => {
    receiptMap.set(receipt.transaction_hash, receipt);
  });

  // Sort donations by timestamp (newest first)
  const sortedDonations = [...donations].sort(
    (a, b) => b.timestamp.raw - a.timestamp.raw
  );

  return (
    <Card className="border-0 shadow-none bg-transparent">
      {/* Reserve a calculated height for scrolling, similar to the audit component */}
      <div className="h-[calc(98vh-310px)] overflow-auto">
        <div className="space-y-4 pr-4">
          {sortedDonations.map((donation) => (
            <DonationCard
              key={donation.transactionHash}
              donation={donation}
              receipt={receiptMap.get(donation.transactionHash)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
