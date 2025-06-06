import React from "react";
import { usePayTrieQuote } from "@/hooks/paytrie/use-paytrie-quotes";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceDisplayProps {
  balance: number | null;
}

export default function BalanceDisplay({ balance }: BalanceDisplayProps) {
  // ensure usePayTrieQuote always gets a number
  const amountToQuote = balance ?? 0;
  const { quote, isLoading, error } = usePayTrieQuote(amountToQuote);

  // USD → CAD conversion
  const cadValue =
    quote && balance != null ? (balance / quote.cadusd).toFixed(4) : null;

  return (
    <div className="flex flex-col items-center text-center space-y-1">
      <span className="text-xs text-muted-foreground">Your Balance:</span>
      <span id="balance-display" className="text-lg font-semibold">
        {balance != null ? `$${balance.toFixed(4)} USD` : "Loading…"}
      </span>
      <span className="text-sm text-muted-foreground">
        {error ? (
          "Error loading conversion"
        ) : isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : cadValue ? (
          `≈ $${cadValue} CAD`
        ) : null}
      </span>
    </div>
  );
}
