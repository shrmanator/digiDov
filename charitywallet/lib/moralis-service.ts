// lib/moralis-service.js
import { initializeMoralis } from "./moralis";
import Moralis from "moralis";
import { cache } from "react";

// Cache wallet data using React's cache function
export const getWalletData = cache(async (address) => {
  await initializeMoralis();

  try {
    const response = await Moralis.EvmApi.wallets.getWalletNetWorth({
      address,
      excludeSpam: true,
      excludeUnverifiedContracts: true,
    });

    return {
      netWorth: response.raw?.total_networth_usd || null,
    };
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return {
      netWorth: null,
    };
  }
});

// Cache transactions using React's cache function
export const getTransactions = cache(async (address, type = "received") => {
  await initializeMoralis();

  try {
    // Implement your fetchTransactions logic here
    // This depends on how your current fetchTransactions is implemented

    // Example:
    const response = await Moralis.EvmApi.wallet.getWalletTransactions({
      address,
      chain: "0x1", // Ethereum mainnet
    });

    return response.result || [];
  } catch (error) {
    console.error(`Failed to fetch ${type} transactions:`, error);
    return [];
  }
});

export const addWalletAddressToMoralis = async (walletAddress) => {
  await initializeMoralis();

  try {
    const streamId = process.env.MORALIS_STREAM_ID;
    if (!streamId) {
      throw new Error("Stream ID is not configured in environment variables.");
    }

    await Moralis.Streams.addAddress({
      id: streamId,
      address: walletAddress,
    });

    console.log(`Wallet address ${walletAddress} added successfully.`);
  } catch (error) {
    console.error(`Failed to add wallet address ${walletAddress}:`, error);
    throw new Error("Failed to add wallet address to Moralis.");
  }
};

export const removeWalletAddressFromMoralis = async (walletAddress) => {
  await initializeMoralis();

  try {
    const streamId = process.env.MORALIS_STREAM_ID;
    if (!streamId) {
      throw new Error("Stream ID is not configured in environment variables.");
    }

    await Moralis.Streams.deleteAddress({
      id: streamId,
      address: walletAddress,
    });

    console.log(`Wallet address ${walletAddress} removed successfully.`);
  } catch (error) {
    console.error(`Failed to remove wallet address ${walletAddress}:`, error);
    throw new Error("Failed to remove wallet address from Moralis.");
  }
};
