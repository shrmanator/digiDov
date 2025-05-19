// hooks/use-send-erc20-token.tsx

import { useCallback } from "react";
import { getContract } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";
import { useSendTransaction } from "thirdweb/react";
import type { Chain } from "thirdweb/chains";

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

  const onClick = useCallback(() => {
    console.log("→ sending rawAmount:", amount);
    const tx = transfer({
      contract,
      to: recipientAddress,
      amount, // DECIMAL string
    });

    sendTx(tx, {
      onSuccess: () => {
        toast({
          title: "Token Sent",
          description: `Sent ${amount} USDC to ${recipientAddress}`,
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
  }, [amount, contract, recipientAddress, sendTx]);

  return { onClick, isPending, transactionResult };
}
