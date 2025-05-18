import { getContract } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { toWei } from "thirdweb/utils";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";
import { useSendTransaction } from "thirdweb/react";
import type { Chain } from "thirdweb/chains";

export function useSendErc20Token(
  amount: string, // e.g. "12.345"
  recipientAddress: string,
  contractAddress: string,
  chain: Chain
) {
  // 1) This hook gives you back a mutate function plus status flags:
  const {
    mutate: sendTx,
    isPending, // you can use this to disable your button
    data: transactionResult,
  } = useSendTransaction();

  // 2) Instantiate your ERC-20 contract
  const contract = getContract({
    address: contractAddress,
    chain,
    client,
  });

  // 3) Build + send the actual transfer
  const onClick = () => {
    // toWei() will convert your decimal-string into the right units
    const tx = transfer({
      contract,
      to: recipientAddress,
      amount: toWei(amount).toString(),
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
  };

  return { onClick, isPending, transactionResult };
}
