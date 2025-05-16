import { PayTrieTransaction } from "@/app/types/paytrie/paytrie-transaction";
import type { TxPayload } from "@/app/types/paytrie/paytrie-transaction-validation";

/**
 * Place a sell order with the PayTrie API and return the resulting transaction details.
 *
 * This function does not perform the on-chain USDC transfer—after calling this,
 * you must send the returned `depositAmount` of USDC-POLY on-chain to the
 * returned `depositAddress` to complete the off-ramp.
 *
 * @param payload - Validated transaction payload containing quoteId, gasId,
 *   email, wallet address, and leftSide/rightSide labels & values for USDC-POLY → CAD.
 * @param jwt - JWT token obtained after OTP verification for authenticating
 *   the transaction request.
 * @returns A Promise resolving to a PayTrieTransaction with fields:
 *   - transactionId: unique ID for the order
 *   - exchangeRate: CAD→USD rate locked in by the quote
 *   - depositAddress: on-chain address to send USDC-POLY to
 *   - depositAmount: exact amount of USDC-POLY (in decimal units) to send on-chain
 * @throws Error when the HTTP response is not OK or the API returns an error message.
 *
 * @example
 * ```ts
 * // 1. Get a quote via /quotes
 * // 2. Send OTP and verify → obtain JWT
 * // 3. Place sell order with PayTrie
 * const tx = await createPayTrieTransaction(payload, jwt);
 * console.log(tx.depositAddress, tx.depositAmount);
 * // 4. Send `${tx.depositAmount}` USDC-POLY to `${tx.depositAddress}` on-chain
 * ```
 */

export async function createPayTrieTransaction(
  payload: TxPayload,
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
