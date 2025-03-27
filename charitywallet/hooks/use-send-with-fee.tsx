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

  // USD1 Token Contract Address on Ethereum Mainnet
  const USD1_CONTRACT_ADDRESS = "";

  // Retrieve the fee-enabled contract instance based on the active chain.
  const feeContract = useMemo(() => {
    if (!activeChain) return null;

    let contractAddress = "";
    // Check the chain ID: 1 for Ethereum Mainnet.
    if (activeChain.id === 1) {
      // Ethereum mainnet fee deduction contract
      contractAddress = "0x52d3d75f268c24b101631d425c9c94c32aa00688";
    } else {
      console.error("Unsupported chain:", activeChain.id);
      return null;
    }

    try {
      return getContract({
        address: contractAddress,
        chain: activeChain,
        client,
      });
    } catch (error) {
      console.error("getContract validation error:", error);
      return null;
    }
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
      method:
        "function sendWithFeeToken(uint256 donationAmount, address recipient, address tokenAddress)",
      params: [donationValue, recipientAddress, USD1_CONTRACT_ADDRESS],
    });

    sendTx(transaction, {
      onSuccess: () => {
        toast({
          title: "Donation Sent",
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
