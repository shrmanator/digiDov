"use client";

import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";

// Retrieve the fee-enabled contract instance.
const feeContract = getContract({
  address: "0x678C769Ae4505D91bA112EA2C9cEbcAbD86AF2a9", // Replace with your contract address
  chain: polygon,
  client,
});

export function useSendWithFee(
  donationValue: bigint,
  recipientAddress: string
) {
  const {
    mutate: sendTx,
    isPending,
    data: transactionResult,
  } = useSendTransaction();

  const onClick = () => {
    const transaction = prepareContractCall({
      contract: feeContract,
      method: "function sendWithFee(address recipient) payable",
      params: [recipientAddress],
      value: donationValue,
    });

    sendTx(transaction, {
      onSuccess: (txResult) => {
        toast({
          title: "Transaction Sent",
          description: "Your donation transaction has been sent.",
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
