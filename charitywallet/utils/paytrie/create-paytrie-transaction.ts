import type { PaytrieTxPayload } from "@/app/types/paytrie/paytrie-transaction-validation";
import type { PayTrieTransaction } from "@/app/types/paytrie/paytrie-transaction";

/**
 * Places a sell order with the PayTrie API and returns transaction details.
 * @param payload - Prepared sell order payload.
 * @param jwt - JWT from OTP verification.
 * @returns PayTrieTransaction containing IDs, rates, and deposit info.
 * @throws Error if the API response is not OK.
 */
export async function placePaytrieSellOrder(
  payload: PaytrieTxPayload,
  jwt: string
): Promise<PayTrieTransaction> {
  const response = await fetch("/api/paytrie/transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, jwt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayTrie API error: ${errorText}`);
  }

  const data = await response.json();
  return {
    transactionId: data.transactionId ?? data.tx_id ?? "<missing_tx_id>",
    exchangeRate: data.exchangeRate ?? data.exchange_rate ?? "<missing_rate>",
    depositAddress: data.depositAddress ?? data.deposit_address ?? "",
    depositAmount: data.depositAmount ?? data.deposit_amount ?? 0,
  };
}
