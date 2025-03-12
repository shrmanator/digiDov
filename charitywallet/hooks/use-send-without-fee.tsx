"use client";

import { useSendTransaction, useActiveWalletChain } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";

export function useSendCrypto(amount: bigint, recipientAddress: string) {
  const activeChain = useActiveWalletChain();

  const {
    mutate: sendTx,
    isPending,
    data: transactionResult,
  } = useSendTransaction();

  const onClick = () => {
    if (!activeChain) {
      console.error("Active chain not available.");
      return;
    }

    // Include chain and client so that the transaction object matches the expected type.
    const transaction = {
      to: recipientAddress,
      amount,
      chain: activeChain,
      client: client,
    };

    sendTx(transaction, {
      onSuccess: () => {
        toast({
          title: "Transaction Sent",
          description: `Transaction sent to ${recipientAddress}`,
        });
      },
      onError: (error) => {
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
