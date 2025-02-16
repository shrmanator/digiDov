import Moralis from "moralis";

export const initializeMoralis = async () => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    console.log("Moralis initialized successfully.");
  }
};
