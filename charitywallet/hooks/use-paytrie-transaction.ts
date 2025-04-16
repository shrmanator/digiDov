import { useState } from "react";

interface PaytrieTransactionData {
  quoteId: number;
  gasId: number;
  email: string;
  wallet: string;
  leftSideLabel: string;
  leftSideValue: number;
  rightSideLabel: string;
  ethCost?: string;
  vendorId?: number;
  useReferral?: boolean;
}

interface UsePaytrieTransactionResult {
  data: any;
  error: string | null;
  loading: boolean;
  callTransaction: (payload: PaytrieTransactionData) => Promise<void>;
}

export function usePaytrieTransaction(): UsePaytrieTransactionResult {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const callTransaction = async (payload: PaytrieTransactionData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/paytrie/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "An error occurred");
      }
      const responseData = await res.json();
      setData(responseData);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, callTransaction };
}
