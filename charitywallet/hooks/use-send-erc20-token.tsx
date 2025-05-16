import { getContract } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { toWei } from "thirdweb/utils";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";
import { useSendTransaction } from "thirdweb/react";
import type { Chain } from "thirdweb/chains";

/**
 * Hook to send any ERC-20 token on any supported chain.
 *
 * @param amount           Amount of tokens (decimal string) to send.
 * @param recipientAddress Address to receive the tokens.
 * @param contractAddress  ERC-20 contract address to send from.
 * @param chain            Chain object (e.g. polygon, ethereum, etc.).
 */
export function useSendErc20Token(
  amount: string,
  recipientAddress: string,
  contractAddress: string,
  chain: Chain
) {
  const {
    mutate: sendTx,
    isPending,
    data: transactionResult,
  } = useSendTransaction();

  const contract = getContract({
    address: contractAddress,
    chain,
    client,
  });

  function onClick() {
    const tx = transfer({
      contract,
      to: recipientAddress,
      amount: toWei(amount).toString(),
    });

    sendTx(tx, {
      onSuccess: () => {
        toast({
          title: "Token Sent",
          description: `Sent ${amount} tokens to ${recipientAddress}`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Transaction Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  return { onClick, isPending, transactionResult };
}
