const { Alchemy, Network } = require("alchemy-sdk");

// Ethereum Mainnet Configuration
const ethSettings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET, // Ethereum Mainnet
};

const alchemyEth = new Alchemy(ethSettings);

// Polygon Mainnet Configuration
const polygonSettings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET, // Polygon Mainnet
};

const alchemyPolygon = new Alchemy(polygonSettings);
