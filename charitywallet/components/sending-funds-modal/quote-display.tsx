"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayTrieQuote } from "@/hooks/paytrie/use-paytrie-quotes";

export default function QuoteDisplay() {
  const { quote, isLoading, error } = usePayTrieQuote();

  if (error) {
    return <span className="text-sm text-destructive">Error loading rate</span>;
  }

  return (
    <span className="flex items-center text-sm text-muted-foreground">
      {isLoading ? (
        <Skeleton className="h-4 w-24" />
      ) : quote ? (
        <>1 CAD ≈ {quote.cadusd.toFixed(4)} USD</>
      ) : (
        "No rate"
      )}
    </span>
  );
}
