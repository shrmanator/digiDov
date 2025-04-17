import { TxPayload } from "@/app/types/paytrie-transaction-validation";
import { useState, useEffect } from "react";

export interface PayTrieResponse {
  tx: string;
  fxRate: string /* … */;
}

export function usePayTrieTransaction(payload: TxPayload | null) {
  const [data, setData] = useState<PayTrieResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!payload) return;
    setLoading(true);
    fetch("/api/paytrie/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [payload]);

  return { data, error, isLoading };
}
