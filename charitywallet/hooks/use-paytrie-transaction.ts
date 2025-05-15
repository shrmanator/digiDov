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

        // parse whatever shape PayTrie actually gives us
        const data = await response.json();
        console.log("[PayTrie] raw tx response:", data);

        const tx: PayTrieTransaction = {
          transactionId: data.transactionId ?? data.tx_id ?? "<missing_tx_id>",
          exchangeRate:
            (data.exchangeRate as string) ??
            (data.exchange_rate as string) ??
            "<missing_rate>",
          depositAddress:
            (data.depositAddress as string) ??
            (data.deposit_address as string) ??
            "",
          depositAmount:
            (data.depositAmount as number) ??
            (data.deposit_amount as number) ??
            0,
        };

        setTransaction(tx);
        return tx;
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
