"use client";

import { useSendTransaction, useActiveWalletChain } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { useMemo } from "react";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";

/** Uniswap V3 0.3 % pool */
const DEFAULT_POOL_FEE = 3000;
/** 0.5 % slippage tolerance = 50 bps */
const DEFAULT_SLIPPAGE_BPS = 50;

export function useSendWithFee(
  donationValue: bigint,
  charityAddress: string,
  poolFee: number = DEFAULT_POOL_FEE
) {
  const activeChain = useActiveWalletChain();

  const feeContract = useMemo(() => {
    if (!activeChain) return null;
    if (activeChain.id !== 137) {
      toast({ title: "Unsupported chain", variant: "destructive" });
      return null;
    }
    return getContract({
      address: "0x2ad35AA65D6E1B8dd8DA41F8639d08b1abE3964f",
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
      toast({
        title: "Chain not supported",
        description: "Switch to Polygon to donate.",
        variant: "destructive",
      });
      return;
    }

    // ⚠️ Include the slippageBps (uint16) as the 3rd arg
    const txRequest = prepareContractCall({
      contract: feeContract,
      method: "function donateAndSwap(address,uint24,uint16) payable",
      params: [charityAddress, poolFee, DEFAULT_SLIPPAGE_BPS],
      value: donationValue,
    });

    sendTx(txRequest, {
      onSuccess: () =>
        toast({
          title: "Donation Sent",
          description:
            "Your POL is being broadcast to the blockchain. Thanks for donating!",
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
