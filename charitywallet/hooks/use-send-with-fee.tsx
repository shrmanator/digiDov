"use client";

import { useSendTransaction, useActiveWalletChain } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { useMemo } from "react";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";

export function useSendWithFee(
  donationValue: bigint,
  recipientAddress: string
) {
  const activeChain = useActiveWalletChain();

  // Retrieve the fee-enabled contract instance based on the active chain.
  const feeContract = useMemo(() => {
    if (!activeChain) return null;

    let contractAddress = "";
    // Check the chain ID: 1 for Ethereum, 137 for Polygon.
    if (activeChain.id === 1) {
      // Ethereum mainnet
      contractAddress = "0x27fEde2dC50C03EF8C90Bf1Aa9Cf69A3D181c9DF";
    } else if (activeChain.id === 137) {
      // Polygon mainnet
      contractAddress = "0x1C8Ed2efAeD9F2d4F13e8F95973Ac8B50A862Ef0";
    } else {
      console.error("Unsupported chain:", activeChain.id);
      return null;
    }

    return getContract({
      address: contractAddress,
      chain: activeChain,
      client,
    });
  }, [activeChain]);

  const {
    mutate: sendTx,
    isPending,
    data: transactionResult,
  } = useSendTransaction();

  const onClick = () => {
    if (!feeContract) {
      console.error("Active chain not available for fee contract.");
      return;
    }

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
