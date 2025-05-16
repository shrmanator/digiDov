import { useState, useCallback } from "react";
import type { TxPayload } from "@/app/types/paytrie/paytrie-transaction-validation";
import { createPayTrieTransaction } from "@/utils/create-paytrie-transaction";
import type { PayTrieTransaction } from "@/app/types/paytrie/paytrie-transaction";

/**
 * Hook to place PayTrie sell orders and manage loading/error state.
 *
 * Wraps `createPayTrieTransaction`, returning:
 * - `createTransaction`: function to call with payload and JWT
 * - `transaction`: the latest successful transaction or null
 * - `transactionError`: error from the last attempt or null
 * - `isSubmitting`: indicates whether an order is in progress
 *
 * Example:
 * ```tsx
 * const { createTransaction, transaction, isSubmitting, transactionError } = usePayTrieTransaction();
 *
 * const onClick = async () => {
 *   try {
 *     const tx = await createTransaction(payload, jwt);
 *     console.log('Order placed', tx.transactionId);
 *   } catch {
 *     console.log('Failed to place order');
 *   }
 * };
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
