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
  // Log hook parameters
  console.log("useSendErc20Token initialized with:", {
    amount,
    recipientAddress,
    contractAddress,
    chain,
  });

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
    console.log("useSendErc20Token.onClick triggered");
    console.log("→ preparing to send rawAmount:", amount);

    const tx = transfer({
      contract,
      to: recipientAddress,
      amount, // DECIMAL string
    });
    console.log("useSendErc20Token: transfer tx object created", tx);

    sendTx(tx, {
      onSuccess: () => {
        console.log("useSendErc20Token: onSuccess callback");
        toast({
          title: "Token Sent",
          description: `Sent ${amount} USDC to ${recipientAddress}`,
        });
      },
      onError: (error: Error) => {
        console.error("useSendErc20Token: onError callback", error);
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
