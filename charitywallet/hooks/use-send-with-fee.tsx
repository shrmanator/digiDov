"use client";

import { useSendTransaction, useActiveWalletChain } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { useMemo } from "react";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";

/** Uniswap V3 0.3 % pool */
const DEFAULT_POOL_FEE = 3000;

/**
 * Swap the donated ETH ➜ USDC, then split
 * 97 % to charity / 3 % to platform.
 */
export function useSendWithFee(
  donationValue: bigint,
  charityAddress: string,
  poolFee: number = DEFAULT_POOL_FEE
) {
  const activeChain = useActiveWalletChain();

  /** Get the version of the contract for the current network */
  const feeContract = useMemo(() => {
    if (!activeChain) return null;

    let contractAddress = "";

    switch (activeChain.id) {
      case 137: // Polygon main‑net
        contractAddress = "0x337FeC6c583A8e143Dc0660243cF21Db558c980C";
        break;
      case 1: // Ethereum main‑net – (not yet deployed)
      default:
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

  /** Executes the donation transaction */
  const onClick = () => {
    if (!feeContract) {
      toast({
        title: "Chain not supported",
        description: "Switch to Polygon to donate.",
        variant: "destructive",
      });
      return;
    }

    const txRequest = prepareContractCall({
      contract: feeContract,
      method: "function donateAndSwap(address,uint24) payable",
      params: [charityAddress, poolFee],
      value: donationValue,
    });

    sendTx(txRequest, {
      onSuccess: () =>
        toast({
          title: "Donation Sent",
          description:
            "Your ETH is being swapped to USDC and split. Thanks for donating!",
        }),
      onError: (error) =>
        toast({
          title: "Transaction Failed",
          description: error.message,
          variant: "destructive",
        }),
    });
  };

  return { onClick, isPending, transactionResult };
}
