import { useState, useCallback } from "react";
import type { TxPayload } from "@/app/types/paytrie-transaction-validation";

export interface PayTrieResponse {
  tx: string;
  fxRate: string;
}

export function usePayTrieTransaction() {
  const [data, setData] = useState<PayTrieResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);

  const execute = useCallback(async (payload: TxPayload, jwt: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paytrie/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, jwt }),
      });

      if (!res.ok) throw new Error(await res.text());

      const json = (await res.json()) as PayTrieResponse;
      setData(json);
      return json;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, data, error, isLoading };
}
