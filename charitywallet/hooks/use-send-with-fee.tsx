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
    let contractAddress: string;
    if (activeChain.id === 137) {
      // Polygon main-net
      contractAddress = "0x2ad35AA65D6E1B8dd8DA41F8639d08b1abE3964f";
    } else if (activeChain.id === 1) {
      // Ethereum main-net
      contractAddress = "0x7682aC87d3bB704CC637324d68E31dd8aD9D273e";
    } else {
      toast({
        title: "Unsupported chain",
        description: "Switch to Polygon or Ethereum to donate.",
        variant: "destructive",
      });
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
    if (!feeContract) return;

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
            "Your token is being broadcast to the blockchain. Thanks for donating!",
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
