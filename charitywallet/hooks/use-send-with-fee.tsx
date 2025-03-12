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

  // Only support Ethereum for USDC donations
  const feeContract = useMemo(() => {
    if (!activeChain || activeChain.id !== 1) {
      console.error("Unsupported chain: Please use the Ethereum network.");
      return null;
    }
    // FeeDeductionUSDC contract address on Ethereum
    const contractAddress = "0x738A564459c8D49576c9abd40304e75C064e78d7";
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
      console.error("Fee contract is not available.");
      return;
    }

    // Prepare the contract call for USDC donations.
    // The contract method is defined as:
    // function sendWithFeeToken(uint256 donationAmount, address recipient)
    const transaction = prepareContractCall({
      contract: feeContract,
      method: "function sendWithFeeToken(uint256,address)",
      params: [donationValue, recipientAddress],
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
