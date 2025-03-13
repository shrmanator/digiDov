"use client";

import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { customContract } from "@/utils/get-transaction-with-fee-contract";
import { toast } from "@/hooks/use-toast";

// USDC token address on polygon mainnet
const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

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
    if (!customContract) {
      console.error("Custom contract is not available.");
      return;
    }

    // Prepare the contract call for USDC donation.
    // The method is defined as:
    // function sendWithFeeToken(uint256 donationAmount, address recipient)
    // We add the erc20Value field so the transaction is paid in USDC.
    console.log("donation value", donationValue);
    const transaction = prepareContractCall({
      contract: customContract,
      method: "function sendWithFeeToken(uint256,address)",
      params: [donationValue, recipientAddress],
      erc20Value: {
        tokenAddress: USDC_ADDRESS,
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
