import Moralis from "moralis";

let isInitialized = false;

export const initializeMoralis = async () => {
  if (!isInitialized && !Moralis.Core.isStarted) {
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      throw new Error(
        "MORALIS_API_KEY is not set. Please add it to your environment variables."
      );
    }
    await Moralis.start({ apiKey });
    isInitialized = true;
  }
};

// Initialize Moralis once at server startup
initializeMoralis().catch(console.error);
