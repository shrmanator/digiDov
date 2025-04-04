"use client";

import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, waitForReceipt } from "thirdweb";
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

  const onClick = async () => {
    try {
      // STEP 1: Approve the contract to spend the donation tokens.
      const usdcContract = getContract({
        client,
        address: USDC_POLYGON_MAINNET_ADDRESS,
        chain: polygon,
      });

      const approveTransaction = prepareContractCall({
        contract: usdcContract,
        method: "function approve(address spender, uint256 amount)",
        params: [CUSTOM_CONTRACT_ADDRESS, donationValue],
      });

      // Send approval transaction and wait for confirmation using waitForReceipt
      await new Promise<void>((resolve, reject) => {
        sendTx(approveTransaction, {
          onSuccess: async (tx) => {
            try {
              // Wait for the transaction to be confirmed on-chain
              await waitForReceipt({
                client,
                chain: polygon,
                transactionHash: tx.transactionHash,
              });
              toast({
                title: "Approval Confirmed",
                description: "Contract approved to spend tokens.",
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          onError: (error) => {
            toast({
              title: "Approval Failed",
              description: error.message,
              variant: "destructive",
            });
            reject(error);
          },
        });
      });

      // STEP 2: Call sendWithFeeToken to process the donation.
      const customContract = getContract({
        client,
        address: CUSTOM_CONTRACT_ADDRESS,
        chain: polygon,
      });

      const donationTransaction = prepareContractCall({
        contract: customContract,
        method: "function sendWithFeeToken(uint256,address,address)",
        params: [donationValue, recipientAddress, USDC_POLYGON_MAINNET_ADDRESS],
      });

      sendTx(donationTransaction, {
        onSuccess: () => {
          toast({
            title: "Donation Sent",
            description:
              "Donation sent! You will receive a receipt once the transaction is confirmed.",
          });
        },
        onError: (error) => {
          toast({
            title: "Donation Failed",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Transaction error: ", error);
    }
  };

  return { onClick, isPending, transactionResult };
}
