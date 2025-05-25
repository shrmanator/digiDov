import type { PaytrieTxPayload } from "@/app/types/paytrie/paytrie-transaction-validation";
import { PayTrieQuote } from "@/hooks/paytrie/use-paytrie-quotes";
import { queryObjects } from "v8";

/**
 * Build the payload for a PayTrie off-ramp (sell) order.
 * @param amount - Amount of USDC-POLY to sell.
 * @param quote - The PayTrieQuote object containing quote and gas IDs.
 * @param wallet - User wallet address.
 * @param email - User contact email for OTP.
 * @returns A PaytrieTxPayload ready for the API call.
 */
export function buildPaytrieSellOrderPayload(
  amount: number,
  quote: PayTrieQuote,
  wallet: string,
  email: string
): PaytrieTxPayload {
  console.log("the quote", quote);
  return {
    quoteId: quote.id,
    gasId: quote.gasId,
    email,
    wallet,
    leftSideLabel: "USDC-POLY",
    leftSideValue: amount,
    rightSideLabel: "CAD",
  };
}
