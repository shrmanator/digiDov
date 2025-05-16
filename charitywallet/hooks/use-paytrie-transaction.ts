import { useState, useCallback } from "react";
import type { TxPayload } from "@/app/types/paytrie/paytrie-transaction-validation";
import { createPayTrieTransaction } from "@/utils/create-paytrie-transaction";
import type { PayTrieTransaction } from "@/app/types/paytrie/paytrie-transaction";

/**
 * Custom hook to place PayTrie off-ramp (sell) orders and track their state.
 *
 * This hook wraps createPayTrieTransaction, managing loading and error states
 * and exposing the latest successful transaction.
 *
 * @returns {
 *   createTransaction: (payload: TxPayload, jwt: string) => Promise<PayTrieTransaction>;
 *   transaction: PayTrieTransaction | null;
 *   transactionError: Error | null;
 *   isSubmitting: boolean;
 * }
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { createTransaction, transaction, isSubmitting, transactionError } = usePayTrieTransaction();
 *
 *   const onSubmit = async () => {
 *     try {
 *       const tx = await createTransaction(payload, jwt);
 *       console.log("Order placed", tx.transactionId);
 *     } catch (e) {
 *       console.error("Failed to place order", e);
 *     }
 *   };
 *
 *   // render UI
 * }
 * ```
 */
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
        const tx = await createPayTrieTransaction(payload, jwt);
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

  return { createTransaction, transaction, transactionError, isSubmitting };
}
