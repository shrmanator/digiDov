// hooks/paytrie/use-paytrie-quotes.ts
import { useState, useEffect } from "react";

export interface PayTrieQuote {
  id: number;
  gasId: number;
  fee: number;
  gasFee: number;
  cadusd: number;
  // …any other fields
}

/**
 * Fetch a quote for a given USDC‐POLY sell amount.
 */
export function usePayTrieQuote(amount: number) {
  const [quote, setQuote] = useState<PayTrieQuote | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // skip until user enters a valid >0 amount
    if (amount <= 0) {
      setQuote(null);
      return;
    }

    setLoading(true);
    fetch(`/api/paytrie/quotes?amount=${amount}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PayTrieQuote>;
      })
      .then(setQuote)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [amount]);

  return { quote, isLoading, error };
}
