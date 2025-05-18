"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayTrieQuote } from "@/hooks/paytrie/use-paytrie-quotes";

/**
 * Displays the current USD → CAD conversion rate by quoting 1 USD.
 */
export default function QuoteDisplay() {
  // Always pass 1 to fetch a rate for 1 USD
  const { quote, isLoading, error } = usePayTrieQuote(1);

  if (error) {
    return <span className="text-sm text-destructive">Error loading rate</span>;
  }

  return (
    <span className="flex items-center text-sm text-muted-foreground">
      {isLoading ? (
        <Skeleton className="h-4 w-24" />
      ) : quote && quote.cadusd ? (
        <>1 USD ≈ {(1 / quote.cadusd).toFixed(4)} CAD</>
      ) : (
        "No rate"
      )}
    </span>
  );
}
