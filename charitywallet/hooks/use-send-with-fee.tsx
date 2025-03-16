"use client";

import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { toast } from "@/hooks/use-toast";
import { client } from "@/lib/thirdwebClient";
import { polygon } from "thirdweb/chains";

const USDC_POLYGON_MAINNET_ADDRESS =
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
const CUSTOM_CONTRACT_ADDRESS = "0x7C80328071C13026A299561d19042004ab899c4f";

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
    const customContract = getContract({
      client,
      address: CUSTOM_CONTRACT_ADDRESS,
      chain: polygon,
    });

    const transaction = prepareContractCall({
      contract: customContract,
      method: "function sendWithFeeToken(uint256,address,address)",
      params: [donationValue, recipientAddress, USDC_POLYGON_MAINNET_ADDRESS],
      erc20Value: {
        tokenAddress: USDC_POLYGON_MAINNET_ADDRESS,
        amountWei: donationValue,
      },
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
