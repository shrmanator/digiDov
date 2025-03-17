import { alchemyEth, alchemyPolygon } from "@/lib/alchemy";
import {
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersResponse,
} from "alchemy-sdk";

/**
 * Fetches asset transfers for a given wallet address on a specific network.
 * @param alchemy - The Alchemy instance for the network.
 * @param networkName - The name of the network.
 * @param walletAddress - The wallet address.
 * @returns An array of transactions.
 */
export async function fetchTransfers(
  alchemy: Alchemy,
  networkName: string,
  walletAddress: string
): Promise<AssetTransfersResponse> {
  console.log(
    `fetchTransfers called with network: ${networkName}, walletAddress: ${walletAddress}`
  );

  try {
    const transfers: AssetTransfersResponse =
      await alchemy.core.getAssetTransfers({
        // fromAddress: walletAddress,
        toAddress: walletAddress,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
        ],
        withMetadata: true,
        // excludeZeroValue: true,
        maxCount: 100,
      });

    console.log(`${networkName} EREREER`, transfers);
    return transfers;
  } catch (error) {
    console.error(`Error fetching ${networkName} transfers:`, error);
    return { transfers: [] }; // Return empty array on failure
  }
}

/**
 * Fetches asset transfers for a given wallet address on Ethereum and Polygon.
 * @param walletAddress - The wallet address.
 * @returns An array of transactions.
 */
export async function fetchAllTransfers(
  walletAddress: string
): Promise<AssetTransfersResponse[]> {
  console.log("fetchAllTransfers called with walletAddress:", walletAddress);

  const ethTransfers = await fetchTransfers(
    alchemyEth,
    "Ethereum",
    walletAddress
  );
  const polygonTransfers = await fetchTransfers(
    alchemyPolygon,
    "Polygon",
    walletAddress
  );

  console.log("ethTransfers", ethTransfers);
  console.log("polygonTransfers", polygonTransfers);

  return [ethTransfers, polygonTransfers];
}
