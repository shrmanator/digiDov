"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";
import Web3 from "web3";
import { useHistoricalPrice } from "@/hooks/use-historical-crypto-price";
import { DonationEvent } from "@/utils/fetch-contract-transactions"; // ensure this is exported

const web3 = new Web3();

interface DonationHistoryProps {
  donations: DonationEvent[];
}

function DonationItem({ donation }: { donation: DonationEvent }) {
  // Convert donation.netAmount (a string in wei) to ETH
  const nativeValue = web3.utils.fromWei(donation.netAmount, "ether");
  const formattedDate = donation.timestamp.formatted;

  // Get historical price using the donation's timestamp (converted to ISO string)
  const historicalPrice = useHistoricalPrice(
    "ETH",
    new Date(donation.timestamp.raw).toISOString(),
    "usd"
  );
  const usdValue =
    historicalPrice && !isNaN(parseFloat(nativeValue))
      ? parseFloat(nativeValue) * historicalPrice
      : 0;

  return (
    <Card
      key={donation.transactionHash}
      className="w-full rounded-xl border border-border bg-background hover:shadow-xl transition"
    >
      <CardContent className="flex flex-col p-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-semibold">
            ${usdValue.toFixed(2)}{" "}
            <span className="text-base font-normal">({nativeValue} ETH)</span>
          </span>
          <ArrowDownLeft className="text-green-500 h-6 w-6" />
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          <WalletCopyButton walletAddress={donation.donor} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DonationHistory({ donations }: DonationHistoryProps) {
  if (!donations.length) {
    return <p className="text-center">No donations found.</p>;
  }

  return (
    <div className="w-full">
      <ScrollArea style={{ height: "78vh" }} className="w-full">
        <div className="flex flex-col space-y-4">
          {donations.map((donation) => (
            <DonationItem key={donation.transactionHash} donation={donation} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
