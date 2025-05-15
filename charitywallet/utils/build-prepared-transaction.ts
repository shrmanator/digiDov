import { PreparedTransaction, prepareTransaction, toWei } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";

/**
 * Builds a prepared transaction for later signing / sending.
 */
export function buildPreparedTransaction(
  to: string,
  amount: string
): PreparedTransaction {
  return prepareTransaction({
    to,
    value: toWei(amount),
    chain: ethereum,
    client: thirdwebClient,
  });
}
