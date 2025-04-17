import { useState, useEffect } from "react";

export interface PayTrieQuote {
  id: number;
  gasId: number;
  fee: number;
  gasFee: number;
  cadusd: number;
  // …plus any other fields returned by PayTrie
}

export function usePayTrieQuotes() {
  const [quotes, setQuotes] = useState<PayTrieQuote[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/paytrie/quotes")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PayTrieQuote[]>;
      })
      .then(setQuotes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { quotes, isLoading, error };
}
