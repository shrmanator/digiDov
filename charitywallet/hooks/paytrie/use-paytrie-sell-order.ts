import { useState, useCallback } from "react";
import type { PaytrieTxPayload } from "@/app/types/paytrie/paytrie-transaction-validation";
import type { PayTrieTransaction } from "@/app/types/paytrie/paytrie-transaction";
import { placePaytrieSellOrder } from "@/utils/paytrie/create-paytrie-transaction";

/**
 * Hook to place PayTrie sell orders and manage loading/error state.
 *
 * Wraps `placePaytrieSellOrder`, returning:
 * - `placeSellOrder`: function to call with payload and JWT
 * - `transaction`: the latest successful transaction or null
 * - `transactionError`: error from the last attempt or null
 * - `isSubmitting`: indicates whether an order is in progress
 *
 * Example:
 * ```tsx
 * const { placeSellOrder, transaction, isSubmitting, transactionError } = usePaytrieSellOrder();
 *
 * const onClick = async () => {
 *   try {
 *     const tx = await placeSellOrder(payload, jwt);
 *     console.log('Order placed', tx.transactionId);
 *   } catch {
 *     console.log('Failed to place order');
 *   }
 * };
 * ```
 */
export function usePaytrieSellOrder() {
  const [transaction, setTransaction] = useState<PayTrieTransaction | null>(
    null
  );
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const placeSellOrder = useCallback(
    async (payload: PaytrieTxPayload, jwt: string) => {
      setIsSubmitting(true);
      setTransactionError(null);
      try {
        const tx = await placePaytrieSellOrder(payload, jwt);
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

  return { placeSellOrder, transaction, transactionError, isSubmitting };
}
