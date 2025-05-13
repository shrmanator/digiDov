// use-send-with-fee.ts
"use client";

import { useState } from "react";
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, waitForReceipt } from "thirdweb";
import { toast } from "@/hooks/use-toast";
import { client } from "@/lib/thirdwebClient";
import { polygon } from "thirdweb/chains";

export type SendWithFeeStatus =
  | "idle"
  | "approving"
  | "donating"
  | "success"
  | "error";

const ERC20_POLYGON_MAINNET_ADDRESS =
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
const CUSTOM_CONTRACT_ADDRESS = "0x7C80328071C13026A299561d19042004ab899c4f";

export function useSendWithFee(
  donationValue: bigint,
  recipientAddress: string
) {
  const { mutateAsync: sendTx } = useSendTransaction();
  const [status, setStatus] = useState<SendWithFeeStatus>("idle");

  const onClick = async () => {
    try {
      // 1️⃣ Approve
      setStatus("approving");
      const usdc = getContract({
        client,
        address: ERC20_POLYGON_MAINNET_ADDRESS,
        chain: polygon,
      });
      const approveCall = prepareContractCall({
        contract: usdc,
        method: "function approve(address,uint256)",
        params: [CUSTOM_CONTRACT_ADDRESS, donationValue],
      });

      const approveTx = await sendTx(approveCall);
      await waitForReceipt({
        client,
        chain: polygon,
        transactionHash: approveTx.transactionHash,
      });
      toast({ title: "Approval Confirmed" });

      // 2️⃣ Donate
      setStatus("donating");
      const custom = getContract({
        client,
        address: CUSTOM_CONTRACT_ADDRESS,
        chain: polygon,
      });
      const donateCall = prepareContractCall({
        contract: custom,
        method: "function sendWithFeeToken(uint256,address,address)",
        params: [
          donationValue,
          recipientAddress,
          ERC20_POLYGON_MAINNET_ADDRESS,
        ],
      });

      const donateTx = await sendTx(donateCall);
      await waitForReceipt({
        client,
        chain: polygon,
        transactionHash: donateTx.transactionHash,
      });
      toast({ title: "Donation Confirmed" });
      setStatus("success");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Transaction Error",
        description: error.message,
        variant: "destructive",
      });
      setStatus("error");
    }
  };

  return { onClick, status };
}
