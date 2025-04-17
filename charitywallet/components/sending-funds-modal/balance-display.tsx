"use client";

import { usePayTrieQuote } from "@/hooks/use-paytrie-quotes";

interface Props {
  balance: number | null;
}

export default function BalanceDisplay({ balance }: Props) {
  const { quote, isLoading, error } = usePayTrieQuote();

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="mb-2">
        <label
          htmlFor="balance-display"
          className="block text-xs text-muted-foreground mb-1"
        >
          Your Balance&nbsp;(ETH)
        </label>
        <div
          id="balance-display"
          className="bg-muted p-2 rounded font-semibold text-base"
        >
          {balance !== null ? balance.toFixed(4) : "Loading..."}
        </div>
      </div>

      {/* Quote Display */}
      <div>
        <label
          htmlFor="quote-display"
          className="block text-xs text-muted-foreground mb-1"
        >
          Current PayTrie Quote
        </label>

        {isLoading && <div>Loading quote…</div>}
        {error && (
          <div className="text-red-600">
            Error loading quote: {error.message}
          </div>
        )}

        {quote && (
          <div id="quote-display" className="bg-muted p-2 rounded">
            <p>
              <strong>ID:</strong> {quote.id}
            </p>
            <p>
              <strong>Fee:</strong> {quote.fee}
            </p>
            <p>
              <strong>Gas ID:</strong> {quote.gasId}
            </p>
            <p>
              <strong>Rate (CAD→USD):</strong> {quote.cadusd.toFixed(4)}
            </p>
            {/* add other fields as needed */}
          </div>
        )}
      </div>
    </div>
  );
}
