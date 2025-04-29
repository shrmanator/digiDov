import { useState, useCallback } from "react";
import type { TxPayload } from "@/app/types/paytrie-transaction-validation";

export interface PayTrieTransaction {
  transactionId: string;
  exchangeRate: string;
  depositAddress: string;
  depositAmount: number;
}

export function usePayTrieTransaction() {
  const [transaction, setTransaction] = useState<PayTrieTransaction | null>(
    null
  );
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTransaction = useCallback(
    async (payload: TxPayload, jwt: string) => {
      setIsSubmitting(true);
      setTransactionError(null);
      try {
        const response = await fetch("/api/paytrie/transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, jwt }),
        });
        if (!response.ok) throw new Error(await response.text());

        const result = (await response.json()) as PayTrieTransaction;
        setTransaction(result);
        return result;
      } catch (e: any) {
        setTransactionError(e);
        throw e;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    createTransaction,
    transaction,
    transactionError,
    isSubmitting,
  };
}
