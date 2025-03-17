import { Alchemy, Network } from "alchemy-sdk";

// Ethereum Mainnet Configuration
const ethSettings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET, // Ethereum Mainnet
};
console.log("ethSettings", ethSettings);
export const alchemyEth = new Alchemy(ethSettings);

// Polygon Mainnet Configuration
const polygonSettings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET, // Polygon Mainnet
};
console.log("polygonSettings", polygonSettings);
export const alchemyPolygon = new Alchemy(polygonSettings);
