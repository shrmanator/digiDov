import { useState, useEffect } from "react";

export interface PayTrieQuote {
  id: number;
  gasId: number;
  fee: number;
  gasFee: number;
  cadusd: number;
  // …plus any other fields returned by PayTrie
}

export function usePayTrieQuote() {
  const [quote, setQuote] = useState<PayTrieQuote | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/paytrie/quotes")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // <-- Note: we cast to a single object, not an array
        return res.json() as Promise<PayTrieQuote>;
      })
      .then(setQuote)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { quote, isLoading, error };
}
