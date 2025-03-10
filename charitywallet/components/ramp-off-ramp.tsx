"use client";
import React, { FC } from "react";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import {
  AssetInfo,
  IOnSendCryptoResult,
} from "@ramp-network/ramp-instant-sdk/dist/types/types";

interface RampOfframpProps {
  userAddress: string;
  amount: string;
}

const RampOfframp: FC<RampOfframpProps> = ({ userAddress, amount }) => {
  const openRamp = () => {
    // Initialize the Ramp widget with your configuration
    const ramp = new RampInstantSDK({
      hostAppName: "My Thirdweb dApp",
      hostLogoUrl: "https://yourdomain.com/logo.png",
      hostApiKey: "your_api_key", // replace with your actual API key
      swapAmount: amount, // in wei
      swapAsset: "ETH_ETH",
      userAddress: userAddress, // Pass the user's wallet address as a prop
      useSendCryptoCallback: true, // Enables native flow
    });

    // Register the onSendCrypto callback to handle the crypto transfer
    ramp.onSendCrypto(
      async (
        assetInfo: AssetInfo,
        amount: string,
        address: string
      ): Promise<IOnSendCryptoResult> => {
        try {
          const txHash = await sendCryptoTransaction(
            assetInfo,
            amount,
            address
          );
          return { txHash };
        } catch (error: any) {
          console.error("Error sending crypto", error);
          // In case of error, return an empty transaction hash (or handle as you see fit)
          return { txHash: "" };
        }
      }
    );

    // Display the Ramp widget
    ramp.show();
  };

  // Dummy implementation for sending crypto – replace with your actual logic
  async function sendCryptoTransaction(
    assetInfo: AssetInfo,
    amount: string,
    address: string
  ): Promise<string> {
    console.log(
      "Sending crypto with assetInfo:",
      assetInfo,
      "amount:",
      amount,
      "address:",
      address
    );
    // Here you would trigger the wallet transaction and return the transaction hash
    return "0xExampleTxHash";
  }

  return (
    <div className="my-4">
      <button onClick={openRamp} className="btn btn-primary">
        Sell Crypto Offramp
      </button>
    </div>
  );
};

export default RampOfframp;
