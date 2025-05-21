import { useState, useCallback } from "react";
import type { PaytrieTxPayload } from "@/app/types/paytrie/paytrie-transaction-validation";
import type { PayTrieTransaction } from "@/app/types/paytrie/paytrie-transaction";
import { placePaytrieSellOrder } from "@/utils/paytrie/create-paytrie-transaction";

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
