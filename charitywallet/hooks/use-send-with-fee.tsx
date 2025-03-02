"use client";

import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";

// Retrieve the fee-enabled contract instance.
const feeContract = getContract({
  address: "0x1C8Ed2efAeD9F2d4F13e8F95973Ac8B50A862Ef0",
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
      onSuccess: () => {
        toast({
          title: "Transaction Sent",
          description:
            "Donation sent! You will receive a receipt once the transaction is confirmed.",
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
