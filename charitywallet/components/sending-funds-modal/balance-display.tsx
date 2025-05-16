"use client";

import React from "react";
import { usePayTrieQuote } from "@/hooks/paytrie/use-paytrie-quotes";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  balance: number | null;
}

export default function BalanceDisplay({ balance }: Props) {
  const { quote, isLoading, error } = usePayTrieQuote();

  // Calculate USD to CAD: USD amount / (USD per CAD) = CAD amount
  const cadValue =
    quote && balance != null && quote.cadusd
      ? (balance / quote.cadusd).toFixed(4)
      : null;

  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">Your Balance:</span>
      <span id="balance-display" className="mt-1 text-lg font-semibold">
        {balance != null ? (
          `$${balance.toFixed(4)} USD`
        ) : (
          <span className="opacity-50">Loading…</span>
        )}
      </span>
      {/* <span className="text-sm text-muted-foreground mt-1">
        {error ? (
          "Error loading conversion"
        ) : isLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : cadValue ? (
          `≈ $${cadValue} CAD`
        ) : null}
      </span> */}
    </div>
  );
}
