"use client";
import { useState } from "react";
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, waitForReceipt } from "thirdweb";
import { toast } from "@/hooks/use-toast";
import { client } from "@/lib/thirdwebClient";
import { polygon } from "thirdweb/chains";
import {
  POLYGON_USDC_ADDRESS,
  CUSTOM_CONTRACT_ADDRESS,
} from "@/constants/blockchain";

export function useSendWithFee(
  donationValue: bigint,
  recipientAddress: string
) {
  const { mutateAsync: sendTx } = useSendTransaction();
  const [status, setStatus] = useState<
    "idle" | "approving" | "donating" | "success" | "error"
  >("idle");

  const onClick = async () => {
    try {
      // Approve USDC
      setStatus("approving");
      const usdc = getContract({
        client,
        address: POLYGON_USDC_ADDRESS,
        chain: polygon,
      });
      const approveCall = prepareContractCall({
        contract: usdc,
        method: "function approve(address,uint256)",
        params: [CUSTOM_CONTRACT_ADDRESS, donationValue],
      });
      const { transactionHash: ah } = await sendTx(approveCall);
      await waitForReceipt({ client, chain: polygon, transactionHash: ah });
      toast({
        title: "Approval Confirmed",
      });

      // Execute donation
      setStatus("donating");
      const custom = getContract({
        client,
        address: CUSTOM_CONTRACT_ADDRESS,
        chain: polygon,
      });
      const donateCall = prepareContractCall({
        contract: custom,
        method: "function sendWithFeeToken(uint256,address,address)",
        params: [donationValue, recipientAddress, POLYGON_USDC_ADDRESS],
      });
      const { transactionHash: dh } = await sendTx(donateCall);
      await waitForReceipt({ client, chain: polygon, transactionHash: dh });
      toast({ title: "Donation Sent" });
      setStatus("success");
    } catch (e: any) {
      console.error("Tx error:", e);
      toast({
        title: "Transaction Error",
        description: e.message,
        variant: "destructive",
      });
      setStatus("error");
    }
  };

  return { onClick, status };
}
