import {
  Alchemy,
  Network,
  AssetTransfersCategory,
  AssetTransfersResponse,
} from "alchemy-sdk";

/**
 * Fetches asset transfers for a given wallet address on a specified network.
 * @param alchemy - The Alchemy instance connected to the desired network.
 * @param networkName - The name of the network (e.g., 'Ethereum', 'Polygon').
 * @param walletAddress - The wallet address to fetch transactions for.
 * @returns A promise that resolves to an array of asset transfers.
 */
export async function fetchTransfers(
  alchemy: Alchemy,
  networkName: string,
  walletAddress: string
): Promise<void> {
  try {
    const transfers: AssetTransfersResponse =
      await alchemy.core.getAssetTransfers({
        fromAddress: walletAddress,
        toAddress: walletAddress,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
        //   AssetTransfersCategory.ERC20,
        //   AssetTransfersCategory.ERC721,
        //   AssetTransfersCategory.ERC1155,
        ],
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: 100,
      });

    console.log(`\n${networkName} Transfers for ${walletAddress}:`);
    console.log(transfers.transfers);
  } catch (error) {
    console.error(
      `Error fetching ${networkName} transfers for ${walletAddress}:`,
      error
    );
  }
}

/**
 * Fetches asset transfers for a given wallet address on both Ethereum and Polygon networks.
 * @param walletAddress - The wallet address to fetch transactions for.
 */
export async function fetchAllTransfers(walletAddress: string): Promise<void> {
  await fetchTransfers(alchemyEth, "Ethereum", walletAddress);
  await fetchTransfers(alchemyPolygon, "Polygon", walletAddress);
}
