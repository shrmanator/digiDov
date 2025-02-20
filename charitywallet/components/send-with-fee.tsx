"use client";

import React from "react";
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Retrieve the fee-enabled contract instance
const feeContract = getContract({
  address: "0x678C769Ae4505D91bA112EA2C9cEbcAbD86AF2a9", // Replace with your contract address
  chain: polygon,
  client,
});

interface SendWithFeeButtonProps {
  donationValue: bigint; // donation amount in wei as BigInt
  recipientAddress: string; 
}

export default function SendWithFeeButton({
  donationValue,
  recipientAddress,
}: SendWithFeeButtonProps) {
  const {
    mutate: sendTx,
    isPending,
    data: transactionResult,
  } = useSendTransaction();

  const onClick = () => {
    console.log(
      "Preparing transaction with donationValue:",
      donationValue,
      "recipient address:",
      recipientAddress
    );

    // Prepare the transaction to call sendWithFee on the fee-enabled contract
    const transaction = prepareContractCall({
      contract: feeContract,
      method: "function sendWithFee(address recipient) payable",
      params: [recipientAddress],
      value: donationValue,
    });

    console.log("Prepared transaction:", transaction);

    sendTx(transaction, {
      onSuccess: (txResult) => {
        console.log("Transaction sent successfully:", txResult);
        toast({
          title: "Transaction Sent",
          description: "Your donation transaction has been sent.",
        });
      },
      onError: (error) => {
        console.error("Donation transaction failed:", error);
        toast({
          title: "Transaction Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div>
      <Button onClick={onClick} disabled={isPending}>
        {isPending
          ? "Processing..."
          : transactionResult
          ? "Transaction Sent"
          : "Send With Fee"}
      </Button>
    </div>
  );
}
