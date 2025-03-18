"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, User } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";
import Web3 from "web3";
import { useHistoricalPrice } from "@/hooks/use-historical-crypto-price";
import { DonationEvent } from "@/utils/fetch-contract-transactions";
import { DonationReceipt } from "@/app/types/receipt";

const web3 = new Web3();

interface DonationHistoryProps {
  donations: DonationEvent[];
  receipts?: DonationReceipt[];
}

const getChainSymbol = (chain: number): string => {
  switch (chain) {
    case 1:
      return "ETH";
    case 137:
      return "POL";
    // Add additional chains as needed.
    default:
      return "N/A";
  }
};

interface DonationItemProps {
  donation: DonationEvent;
  receipt?: DonationReceipt;
}

function DonationItem({ donation, receipt }: DonationItemProps) {
  // Convert and format blockchain values.
  const nativeValue = web3.utils.fromWei(donation.netAmount, "ether");
  const formattedDate = donation.timestamp.formatted;
  const chainSymbol = getChainSymbol(donation.chain);
  const historicalPrice = useHistoricalPrice(
    chainSymbol,
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
      <CardContent className="flex flex-col p-4 space-y-3">
        {/* Donation Amount and Chain Info */}
        <div className="flex items-center space-x-3">
          <span className="text-xl font-semibold">
            ${usdValue.toFixed(2)}{" "}
            <span className="text-base font-normal">
              ({nativeValue} {chainSymbol})
            </span>
          </span>
          <ArrowDownLeft className="text-green-500 h-6 w-6" />
        </div>

        {/* Date and Wallet Address */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          <WalletCopyButton walletAddress={donation.donor} />
        </div>

        {/* Donor Info from Receipt */}
        {receipt?.donor && (
          <div className="mt-2 flex items-center gap-3 rounded-md border border-border bg-secondary p-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">
                {receipt.donor.first_name} {receipt.donor.last_name}
              </p>
              {receipt.donor.email && (
                <p className="text-xs text-muted-foreground">
                  {receipt.donor.email}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DonationHistory({
  donations,
  receipts,
}: DonationHistoryProps) {
  if (!donations.length) {
    return <p className="text-center">No donations found.</p>;
  }

  const receiptMap = new Map<string, DonationReceipt>();
  receipts?.forEach((r) => {
    receiptMap.set(r.transaction_hash, r);
  });

  // Sort donations by most recent
  const sortedDonations = donations
    .slice()
    .sort((a, b) => b.timestamp.raw - a.timestamp.raw);

  return (
    <div className="w-full">
      <ScrollArea style={{ height: "74vh" }} className="w-full">
        <div className="flex flex-col space-y-4">
          {sortedDonations.map((donation) => {
            const matchingReceipt = receiptMap.get(donation.transactionHash);
            return (
              <DonationItem
                key={donation.transactionHash}
                donation={donation}
                receipt={matchingReceipt}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
