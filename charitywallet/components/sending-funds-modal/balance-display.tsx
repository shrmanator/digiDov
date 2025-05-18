import React from "react";
import { usePayTrieQuote } from "@/hooks/paytrie/use-paytrie-quotes"; // named import

interface BalanceDisplayProps {
  balance: number | null;
}

export default function BalanceDisplay({ balance }: BalanceDisplayProps) {
  // ensure we always pass a number
  const amountToQuote = balance ?? 0;
  const { quote, isLoading, error } = usePayTrieQuote(amountToQuote);

  // USD → CAD conversion
  const cadValue =
    quote && balance != null ? (balance / quote.cadusd).toFixed(4) : null;

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

      <span className="text-sm text-muted-foreground mt-1">
        {error ? (
          "Error loading conversion"
        ) : isLoading ? (
          <span className="opacity-50">Loading conversion…</span>
        ) : cadValue ? (
          `≈ $${cadValue} CAD`
        ) : null}
      </span>
    </div>
  );
}
