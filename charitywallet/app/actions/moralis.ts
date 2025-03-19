import Moralis from "moralis";

export const addWalletAddressToMoralis = async (walletAddress: string) => {
  try {
    const streamId = process.env.MORALIS_STREAM_ID_OUTGOING_TRANSACTIONS_WEBHOOK;
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

export const removeWalletAddressFromMoralis = async (walletAddress: string) => {
  try {
    const streamId = process.env.MORALIS_STREAM_ID_OUTGOING_TRANSACTIONS_WEBHOOK;
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
