"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WalletCopyButton } from "./wallet-copy-button";
import { DonationReceipt } from "@/app/types/receipt";

interface DonationHistoryProps {
  receipts: DonationReceipt[];
}

function DonationReceiptItem({ receipt }: { receipt: DonationReceipt }) {
  // Format the donation date
  const formattedDate = new Date(receipt.donation_date).toLocaleString();
  // Build donor and charity info from DB data
  const donorName = receipt.donor
    ? `${receipt.donor.first_name} ${receipt.donor.last_name}`
    : "Anonymous";
  const charityName = receipt.charity ? receipt.charity.charity_name : "N/A";

  return (
    <Card
      key={receipt.id}
      className="w-full rounded-xl border border-border bg-background hover:shadow-xl transition"
    >
      <CardContent className="flex flex-col p-4">
        <div className="flex flex-col space-y-1">
          <p className="text-xl font-semibold">
            Receipt #{receipt.receipt_number} - $
            {receipt.fiat_amount.toFixed(2)}
          </p>
          <p className="text-sm">Donor: {donorName}</p>
          <p className="text-sm">Charity: {charityName}</p>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          <WalletCopyButton walletAddress={receipt.transaction_hash} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DonationHistory({ receipts }: DonationHistoryProps) {
  if (!receipts.length) {
    return <p className="text-center">No donation receipts found.</p>;
  }

  // Sort receipts with the most recent first
  const sortedReceipts = receipts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.donation_date).getTime() -
        new Date(a.donation_date).getTime()
    );

  return (
    <div className="w-full">
      <ScrollArea style={{ height: "74vh" }} className="w-full">
        <div className="flex flex-col space-y-4">
          {sortedReceipts.map((receipt) => (
            <DonationReceiptItem key={receipt.id} receipt={receipt} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
