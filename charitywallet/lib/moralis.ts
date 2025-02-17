import Moralis from "moralis";

export const initializeMoralis = async () => {
  if (!Moralis.Core.isStarted) {
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      throw new Error(
        "MORALIS_API_KEY is not set. Please add it to your environment variables."
      );
    }
    await Moralis.start({ apiKey });
    console.log("Moralis initialized successfully.");
  }
};
